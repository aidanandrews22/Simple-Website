const API_GATEWAY_URL = 'https://hgz2zgyata.execute-api.us-east-2.amazonaws.com/saveNote';
window.saveNote = saveNote;
window.toggleSection = toggleSection;
window.showSection = showSection;
window.changeTranscript = changeTranscript;
window.filterPosts = filterPosts;
window.createNewNote = createNewNote;
window.backToBlog = backToBlog;
window.loadPost = loadPost;
window.toggleGraphView = toggleGraphView;
window.toggleEditMode = toggleEditMode;
window.backToList = backToList;
window.togglePreview = togglePreview;
window.saveEdit = saveEdit;

let blogGraph;
let notesGraph;
let currentNoteId = null;
let markedInstance = null;
let currentBlogPost = null;
let currentNote = null;
let currentFilter = 'all';
let blogGraphVisible = false;
let notesGraphVisible = false;
let rawMarkdownContent = '';
const NOTE_CATEGORIES = ['School', 'Work', 'Misc', 'Personal'];

document.addEventListener('DOMContentLoaded', () => {
  initializeMarked();
  clearLocalStorageAfterDelay();
  
  // Load saved graph states
  blogGraphVisible = localStorage.getItem('blogGraphVisible') === 'true';
  notesGraphVisible = localStorage.getItem('notesGraphVisible') === 'true';
  
  handleNavigation();

  currentBlogPost = localStorage.getItem('currentBlogPost');
  currentNote = localStorage.getItem('currentNote');
  currentFilter = localStorage.getItem('currentFilter') || 'all';

  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
      link.addEventListener('click', function(event) {
          const sectionId = this.getAttribute('href').substring(1);
          showSection(sectionId, event);
          event.preventDefault();
      });
  });
  
  loadPosts('blog');
  loadPosts('notes');
  applyFilter(currentFilter);
  addTabCapture('editTextarea');

  // Set initial states for graph toggles
  document.getElementById('blogGraphViewToggle').checked = blogGraphVisible;
  document.getElementById('notesGraphViewToggle').checked = notesGraphVisible;
});

window.addEventListener('popstate', (event) => {
  handleNavigation();
});

// Standardized function to get container ID
function getContainerId(type) {
  return `${type}Container`;
}

// Standardized function to get graph view ID
function getGraphViewId(type) {
  return `${type}GraphView`;
}

// Standardized function to get toggle container ID
function getToggleContainerId(type) {
  if (type == 'notes') return 'action-buttons';
  return `${type}ToggleContainer`;
}

// Standardized function to get graph view toggle ID
function getGraphViewToggleId(type) {
  return `${type}GraphViewToggle`;
}

function formSubmit() {
    const savedSection = localStorage.getItem('activeSection') || 'about';
    alert('Thank you for your report!');
    setTimeout(() => {
        showSection(savedSection);
    }, 5000);
}

function updateURL(sectionId) {
    const newURL = `/${sectionId}`;
    history.pushState({ section: sectionId }, '', newURL);
}

function showSection(sectionId, event) {
  const sections = document.querySelectorAll('#content > section');
  sections.forEach(section => {
      section.style.display = 'none';
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
      activeSection.style.display = 'block';
      if (sectionId === 'blog' || sectionId === 'notes') {
          const currentPost = sectionId === 'blog' ? currentBlogPost : currentNote;
          const container = document.getElementById(getContainerId(sectionId));
          const postView = document.getElementById('postView');
          const graphView = document.getElementById(getGraphViewId(sectionId));
          const isGraphVisible = sectionId === 'blog' ? blogGraphVisible : notesGraphVisible;
          
          if (currentPost) {
              loadPost(currentPost, sectionId);
              if (container) container.style.display = 'none';
              if (postView) postView.style.display = 'block';
              if (graphView) graphView.style.display = 'none';
          } else {
              if (container) container.style.display = isGraphVisible ? 'none' : 'block';
              if (postView) postView.style.display = 'none';
              if (graphView) graphView.style.display = isGraphVisible ? 'block' : 'none';
              if (isGraphVisible) {
                  const graph = sectionId === 'blog' ? blogGraph : notesGraph;
                  if (graph) {
                      const width = graphView.clientWidth;
                      const height = graphView.clientHeight;
                      graph.width(width).height(height);
                  }
              }
          }
      }
  } else {
      console.error('Section with ID ' + sectionId + ' not found.');
  }
  if (sectionId !== 'report') localStorage.setItem('activeSection', sectionId);
  updateActiveLink(sectionId);
  updateURL(sectionId);

  // Prevent default action and stop propagation
  if (event) {
      event.preventDefault();
      event.stopPropagation();
  }
}

function applyFilter(category) {
  currentFilter = category;
  localStorage.setItem('currentFilter', category);
  filterPosts(category, 'blog');
  filterPosts(category, 'notes');
}

function changeTranscript(type) {
    var iframe = document.getElementById('transcriptFrame');
    var unofficialLink = document.getElementById('unofficialTranscriptLink');
    var officialLink = document.getElementById('officialTranscriptLink');

    if (type === 'unofficial') {
        iframe.src = '/assets/PDF/Aidan Andrews Unofficial Transcript.pdf';
        unofficialLink.classList.add('active');
        officialLink.classList.remove('active');
    } else if (type === 'official') {
        iframe.src = 'assets/PDF/Aidan Andrews Official Transcript.pdf';
        unofficialLink.classList.remove('active');
        officialLink.classList.add('active');
    }
}

function updateActiveLink(activeSectionId) {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
      const sectionId = link.getAttribute('href').substring(1); // Remove the '#' from the href
      if (sectionId === activeSectionId) {
          link.classList.add('active');
      } else {
          link.classList.remove('active');
      }
  });
}

function loadBugReportForm() {
    fetch('/external/report.php')
    .then(response => response.text())
    .then(html => {
        document.getElementById('modal-content').innerHTML = html;
        document.getElementById('modal').style.display = 'block';
    })
    .catch(error => console.error('Failed to load form:', error));
}

function clearLocalStorageAfterDelay() {
    setTimeout(() => {
        localStorage.clear();
        alert('Local storage has been cleared due to inactivity.');
    }, 36000000);
}

function handleNavigation() {
  const pathSegments = window.location.pathname.split('/').filter(segment => segment);
  const sectionId = pathSegments[0];
  const postId = pathSegments[1];

  if ((sectionId === 'blog' || sectionId === 'notes') && postId) {
      loadPost(postId, sectionId);
  } else if (sectionId) {
      showSection(sectionId);
  } else {
      const savedSection = localStorage.getItem('activeSection') || 'about';
      showSection(savedSection);
  }

  applyFilter(currentFilter);
}

//////////// Blog ///////////////////////

function topicPosts(category) {
    backToBlog();
    filterPosts(category);
}

function backToBlog() {
    document.getElementById('blog').style.display = 'block';
    document.getElementById('blogPost').style.display = 'none';
    localStorage.removeItem('currentPost');
    localStorage.setItem('activeSection', 'blog');
    updateURL('blog');
}

function loadBlogPosts() {
  fetch('/blog-posts.json')
    .then(response => response.json())
    .then(posts => {
      const postsContainer = document.getElementById('postsContainer');
      postsContainer.innerHTML = '';
      posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
      });
    })
    .catch(error => console.error('Error loading blog posts:', error));
}

function createPostElement(post, type) {
  const article = document.createElement('article');
  article.className = 'post-item';
  article.id = post.id;

  let summaryHTML = '';
  if (type === 'blog' && post.summary) {
      summaryHTML = `<p class="post-summary">${post.summary}</p>`;
  }

  article.innerHTML = `
      <a href="javascript:void(0);" onclick="loadPost('${post.id}', '${type}')" class="post-title">${post.title}</a>
      <div class="post-date">Written on ${formatDate(post.date)}</div>
      ${summaryHTML}
      <a href="javascript:void(0);" onclick="loadPost('${post.id}', '${type}')" class="read-more">Read more</a>
  `;

  return article;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function loadPosts(type) {
  const url = (type == 'notes') ? `/notes.json` : `/${type}-posts.json`;
  
  fetch(url)
      .then(response => response.json())
      .then(posts => {
          const container = document.getElementById(getContainerId(type));
          if (container) {
              container.innerHTML = '';
              posts.forEach(post => {
                  const postElement = createPostElement(post, type);
                  container.appendChild(postElement);
              });
              initGraph(type, posts);
          } else {
              console.error(`Container for ${type} not found`);
          }
      })
      .catch(error => console.error(`Error loading ${type}:`, error));
}

function loadPost(postId, type) {
  const url = (type === 'notes') ? '/notes.json' : `/${type}-posts.json`;
  fetch(url)
      .then(response => response.json())
      .then(posts => {
          const post = posts.find(p => p.id === postId);
          if (post) {
              let contentPromise;
              if (type === 'blog') {
                  contentPromise = fetch(post.content).then(response => response.text());
              } else {
                  contentPromise = fetch(`/content/notes/${post.id}.md`).then(response => response.text());
              }

              contentPromise.then(content => {
                  rawMarkdownContent = content; // Store the raw Markdown content
                  const parsedContent = parseMarkdown(content);
                  const postContent = document.getElementById('postContent');
                  if (postContent) {
                      postContent.innerHTML = `
                          <h1 class="post-title">${post.title}</h1>
                          <p class="post-date">${formatDate(post.date)}</p>
                          <p class="post-category">Category: ${post.category}</p>
                          <div class="parsed-content">${parsedContent}</div>
                      `;
                      
                      const containerToHide = document.getElementById(getContainerId(type));
                      if (containerToHide) {
                          containerToHide.style.display = 'none';
                      }

                      const postView = document.getElementById('postView');
                      if (postView) {
                          postView.style.display = 'block';
                      }

                      const editButton = document.getElementById('editButton');
                      if (editButton) {
                          editButton.style.display = type === 'notes' ? 'block' : 'none';
                      }

                      const toggleContainer = document.getElementById(getToggleContainerId(type));
                      // console.log(getToggleContainerId(type));
                      if (toggleContainer) {
                          toggleContainer.style.display = 'none';
                      }

                      if (type === 'blog') {
                          currentBlogPost = postId;
                          localStorage.setItem('currentBlogPost', postId);
                      } else {
                          currentNote = postId;
                          localStorage.setItem('currentNote', postId);
                      }
                      localStorage.setItem('activeSection', 'postView');
                      localStorage.setItem('currentType', type);
                      updateURL(`${type}/${postId}`);

                      // Set the category in the edit mode dropdown
                      document.getElementById('editCategory').value = post.category;

                      // Reset edit mode
                      const editMode = document.getElementById('editMode');
                      editMode.style.display = 'none';
                      document.getElementById('editButton').textContent = 'Edit';
                      document.getElementById('editButton').style.display = 'block';
                  } else {
                      console.error('Post content container not found');
                  }
              })
              .catch(error => {
                  console.error('Error loading or parsing post content:', error);
                  const postContent = document.getElementById('postContent');
                  if (postContent) {
                      postContent.innerHTML = `<p>Error loading content: ${error.message}</p>`;
                  }
              });
          } else {
              console.error(`Post with ID ${postId} not found`);
          }
      })
      .catch(error => console.error(`Error loading ${type}:`, error));
}

function filterPosts(category, type) {
  const url = (type == 'notes') ? `/notes.json` : `/${type}-posts.json`;
  fetch(url)
    .then(response => response.json())
    .then(posts => {
      const filteredPosts = category === 'all' ? posts : posts.filter(post => post.category === category);
      const container = document.getElementById(getContainerId(type));
      if (container) {
        container.innerHTML = '';
        filteredPosts.forEach(post => {
          const postElement = createPostElement(post, type);
          container.appendChild(postElement);
        });

        // Update graph if it exists
        const graph = type === 'blog' ? blogGraph : notesGraph;
        if (graph) {
          updateGraphFilter(category, type);
        }
      } else {
        console.error(`Container for ${type} not found`);
      }
    })
    .catch(error => console.error('Error filtering posts:', error));

  // Update active button
  const navElement = document.querySelector(`nav[data-type="${type}"]`);
  if (navElement) {
    const buttons = navElement.querySelectorAll('button');
    buttons.forEach(button => {
      if (button.textContent.toLowerCase() === category.toLowerCase()) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  } else {
    console.error(`Navigation for ${type} not found`);
  }
}

////////// Graph //////////////////

function initGraph(type, posts) {
  const graphContainer = document.getElementById(getGraphViewId(type));
  if (!graphContainer) {
      console.error(`Graph container for ${type} not found`);
      return;
  }

  const width = graphContainer.clientWidth;
  const height = graphContainer.clientHeight;

  const nodes = [];
  const links = [];
  
  const categories = type === 'blog' 
      ? ['Misc', 'CS', 'ML', 'Physics']
      : NOTE_CATEGORIES;
  
  // Add category nodes
  categories.forEach(category => {
      nodes.push({ id: `${type}-${category}`, name: category, val: 30, group: category, isCategory: true, type: type });
  });
  
  // Add links between all category nodes
  for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
          links.push({ 
              source: `${type}-${categories[i]}`, 
              target: `${type}-${categories[j]}`,
              isCategoryLink: true,
              type: type
          });
      }
  }
  
  // Add post/note nodes and links
  posts.forEach(post => {
      if (post.category && categories.includes(post.category)) {
          nodes.push({ id: `${type}-${post.id}`, name: post.title, val: 10, group: post.category, isCategory: false, type: type });
          links.push({ 
              source: `${type}-${post.category}`, 
              target: `${type}-${post.id}`,
              isCategoryLink: false,
              type: type
          });
      }
  });

  const graph = ForceGraph3D()
      (graphContainer)
      .width(width)
      .height(height)
      .backgroundColor('#ffffff')
      .graphData({ nodes, links })
      .nodeId('id')
      .nodeVal(node => node.isCategory ? 30 : 10)
      .nodeLabel('name')
      .nodeColor(node => getNodeColor(node.group, node.type))
      .linkColor(link => link.isCategoryLink ? '#000000' : '#999999')
      .linkWidth(link => link.isCategoryLink ? 2 : 1)
      .linkOpacity(0.5)
      .onNodeClick(node => {
        if (node.isCategory) {
            filterPosts(node.name, node.type);
        } else {
            loadPost(node.id.split('-')[1], node.type);
        }
        // Hide the graph view and show the posts/notes container
        const graphView = document.getElementById(getGraphViewId(node.type));
        const postsContainer = document.getElementById(getContainerId(node.type));
        if (graphView && postsContainer) {
          graphView.style.display = 'none';
          postsContainer.style.display = 'block';
        }
        // Uncheck the graph view toggle
        const graphViewToggle = document.getElementById(getGraphViewToggleId(node.type));
        if (graphViewToggle) {
          graphViewToggle.checked = false;
        }
      })
      .nodeVisibility(node => !node.hidden)
      .linkVisibility(link => !link.hidden)
      .enableNodeDrag(true)
      .enableNavigationControls(true)
      .showNavInfo(true);

  console.log(`${type} graph controls:`, graph.controls());

  if (type === 'blog') {
      blogGraph = graph;
  } else {
      notesGraph = graph;
  }

  updateGraphFilter('all', type);
}

function getNodeColor(group, type) {
  const blogColors = {
      Misc: '#ff7f0e',
      CS: '#2ca02c',
      ML: '#d62728',
      Physics: '#9467bd'
  };
  const noteColors = {
      School: '#1f77b4',
      Work: '#ff7f0e',
      Misc: '#2ca02c',
      Personal: '#d62728'
  };
  return type === 'blog' ? (blogColors[group] || '#1f77b4') : (noteColors[group] || '#1f77b4');
}

function toggleGraphView(type) {
  const postsContainer = document.getElementById(getContainerId(type));
  const graphView = document.getElementById(getGraphViewId(type));
  const graphViewToggle = document.getElementById(getGraphViewToggleId(type));
  
  if (graphViewToggle && graphView && postsContainer) {
      const isGraphVisible = graphViewToggle.checked;
      
      postsContainer.style.display = isGraphVisible ? 'none' : 'block';
      graphView.style.display = isGraphVisible ? 'block' : 'none';
      
      if (isGraphVisible) {
          const graph = type === 'blog' ? blogGraph : notesGraph;
          if (graph) {
              const width = graphView.clientWidth;
              const height = graphView.clientHeight;
              graph.width(width).height(height);
          } else {
              loadPosts(type);  // This will initialize the graph if it doesn't exist
          }
      }
      
      // Update and save the graph visibility state
      if (type === 'blog') {
          blogGraphVisible = isGraphVisible;
          localStorage.setItem('blogGraphVisible', isGraphVisible);
      } else {
          notesGraphVisible = isGraphVisible;
          localStorage.setItem('notesGraphVisible', isGraphVisible);
      }
  } else {
      console.error('Required elements for graph view toggle not found');
  }
}

function handleGraphViewState(type) {
  const graphViewToggle = document.getElementById(`${type}GraphViewToggle`);
  const graphView = document.getElementById(`${type}GraphView`);
  const graph = type === 'blog' ? blogGraph : notesGraph;
  
  if (graphViewToggle && graphView && graph && graphViewToggle.checked) {
      const width = graphView.clientWidth;
      const height = graphView.clientHeight;
      graph.width(width).height(height);
  }
}

function updateGraphFilter(category, type) {
  const graph = type === 'blog' ? blogGraph : notesGraph;
  if (!graph) return;

  const graphData = graph.graphData();
  const nodes = graphData.nodes;
  const links = graphData.links;

  if (category === 'all') {
    nodes.forEach(node => node.hidden = false);
    links.forEach(link => link.hidden = false);
  } else {
    nodes.forEach(node => {
      if (node.isCategory) {
        node.hidden = node.id !== category;
      } else {
        node.hidden = node.group !== category;
      }
    });

    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source.id || n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target.id || n.id === link.target);
      link.hidden = sourceNode.hidden || targetNode.hidden;
    });
  }

  graph.graphData({ nodes, links });

}

///////////// AWS //////////////////////

const IDENTITY_POOL_ID = 'us-east-2:c920fd61-bcd8-43c9-b214-f713ed6539ca';
const REGION = 'us-east-2';
const LAMBDA_FUNCTION_NAME = 'saveNoteFunction';

AWS.config.region = REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID
});

const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});

///////////// Notes //////////////////////

function toggleSection(section) {
  const blogToggle = document.getElementById('blogToggle');
  const notesToggle = document.getElementById('notesToggle');
  const postsContainer = document.getElementById('postsContainer');
  const notesContainer = document.getElementById('notesContainer');

  if (section === 'blog') {
      blogToggle.classList.add('active');
      notesToggle.classList.remove('active');
      postsContainer.style.display = 'block';
      notesContainer.style.display = 'none';
  } else {
      blogToggle.classList.remove('active');
      notesToggle.classList.add('active');
      postsContainer.style.display = 'none';
      notesContainer.style.display = 'block';
      loadNotes();
  }
}

function initializeMarked() {
  if (typeof marked !== 'undefined' && typeof markedCodePreview !== 'undefined' && 
      typeof markedHighlight !== 'undefined' && typeof markedAlert !== 'undefined' &&
      typeof markedFootnote !== 'undefined') {
      markedInstance = new marked.Marked();
      markedInstance.use(markedCodePreview());
      markedInstance.use(markedHighlight.markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
              const language = hljs.getLanguage(lang) ? lang : 'plaintext';
              return hljs.highlight(code, { language }).value;
          }
      }));
      markedInstance.use(markedAlert());
      markedInstance.use(markedFootnote());
      console.log('Marked initialized successfully with code preview, syntax highlighting, alerts, and footnotes');
  } else {
      console.error('Marked library or extensions not found');
  }
}

function parseMarkdown(content) {
  if (!markedInstance) {
      console.error('Marked not initialized');
      return content;
  }

  // Configure marked options
  markedInstance.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
      smartLists: true
  });

  // Custom renderer
  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    if (href) {
        return `<a href="${href}" style="color: #4183C4 !important; text-decoration: none;" title="${title || ''}">${text}</a>`;
    }
    return `<a href="${href}" title="${title || ''}">${text}</a>`;
  };

  // Customize heading rendering
  renderer.heading = (text, level) => {
      return `<h${level} class="markdown-header">${text}</h${level}>`;
  };

  // Customize list rendering
  renderer.list = (body, ordered, start) => {
      const type = ordered ? 'ol' : 'ul';
      const className = ordered ? 'markdown-list ordered' : 'markdown-list';
      return `<${type} class="${className}">${body}</${type}>`;
  };

  // Customize list item rendering
  renderer.listitem = (text, task, checked) => {
      if (typeof text === 'object' && text.text) {
          text = text.text;
      }

      if (typeof text !== 'string') {
          console.error('Unexpected listitem text:', text);
          return `<li>${String(text)}</li>`;
      }

      // Check for bold text at the start (for "Goal:" and "Action:")
      const boldMatch = text.match(/^(\*\*[^*]+:\*\*)(.*)/);
      if (boldMatch) {
          return `<li><strong>${boldMatch[1].replace(/\*/g, '')}</strong>${boldMatch[2]}</li>`;
      }

      return `<li>${text}</li>`;
  };

  markedInstance.use({ renderer });

  try {
      return markedInstance.parse(content);
  } catch (error) {
      console.error('Error parsing Markdown:', error);
      return `<p>Error rendering content: ${error.message}</p>`;
  }
}

function toggleEditMode() {
  const viewMode = document.getElementById('postContent');
  const editMode = document.getElementById('editMode');
  const editButton = document.getElementById('editButton');
  const editTextarea = document.getElementById('editTextarea');

  if (editMode.style.display === 'none') {
      // Switching to edit mode
      const title = viewMode.querySelector('.post-title').textContent;
      
      editTextarea.value = rawMarkdownContent; // Use the raw Markdown content
      document.getElementById('editTitle').value = title;
      
      viewMode.style.display = 'none';
      editMode.style.display = 'block';
      editButton.textContent = 'Cancel';
  } else {
      // Switching to view mode
      editMode.style.display = 'none';
      viewMode.style.display = 'block';
      editButton.textContent = 'Edit';
  }
}

function togglePreview() {
  const editTextarea = document.getElementById('editTextarea');
  const previewContent = document.getElementById('previewContent');
  const previewButton = document.querySelector('.preview-button');

  if (previewContent.style.display === 'none') {
      // Show preview
      previewContent.innerHTML = parseMarkdown(editTextarea.value);
      previewContent.style.display = 'block';
      editTextarea.style.display = 'none';
      previewButton.textContent = 'Edit';
  } else {
      // Show editor
      previewContent.style.display = 'none';
      editTextarea.style.display = 'block';
      previewButton.textContent = 'Preview';
  }
}

function showViewMode() {
  document.getElementById('noteViewMode').style.display = 'block';
  document.getElementById('noteEditMode').style.display = 'none';
}

function createNewNote() {
  const postView = document.getElementById('postView');
  const notesContainer = document.getElementById('notesContainer');
  const notesGraphView = document.getElementById('notesGraphView');
  const editMode = document.getElementById('editMode');
  const editButton = document.getElementById('editButton');

  // Hide notes list and graph view
  notesContainer.style.display = 'none';
  notesGraphView.style.display = 'none';

  // Show post view and edit mode
  postView.style.display = 'block';
  editMode.style.display = 'block';
  editButton.style.display = 'none';

  // Clear existing content and set up for new note
  document.getElementById('postContent').innerHTML = '';
  document.getElementById('editTitle').value = '';
  document.getElementById('editCategory').value = 'Misc';
  document.getElementById('editTextarea').value = '';
  document.getElementById('editPassword').value = '';

  // Set current note to null to indicate it's a new note
  currentNote = null;
  localStorage.removeItem('currentNote');
}

function loadNote(noteId) {
  fetch(`/content/notes/${noteId}.md`)
      .then(response => response.text())
      .then(content => {
          currentNoteId = noteId;
          document.getElementById('noteTextarea').value = content;
          document.getElementById('noteContent').innerHTML = parseMarkdown(content);
          showViewMode();
      })
      .catch(error => console.error('Error loading note:', error));
}

function loadNotes() {
  fetch('/notes.json')
    .then(response => response.json())
    .then(notes => {
      const noteDirectory = document.getElementById('noteDirectory');
      noteDirectory.innerHTML = '';
      
      const categories = {};
      NOTE_CATEGORIES.forEach(category => categories[category] = []);

      notes.forEach(note => {
        if (NOTE_CATEGORIES.includes(note.category)) {
          categories[note.category].push(note);
        } else {
          categories['Misc'].push(note);
        }
      });

      for (const category of NOTE_CATEGORIES) {
        const categoryNotes = categories[category];
        if (categoryNotes.length > 0) {
          const categoryElement = document.createElement('details');
          categoryElement.className = 'category';
          categoryElement.innerHTML = `<summary>${category}</summary>`;
          
          const notesList = document.createElement('ul');
          categoryNotes.forEach(note => {
            const noteElement = document.createElement('li');
            noteElement.innerHTML = `<span class="note-title">${note.title}</span>`;
            noteElement.onclick = () => {
              loadNote(note.id);
              document.querySelectorAll('.note-title').forEach(el => el.classList.remove('selected'));
              noteElement.querySelector('.note-title').classList.add('selected');
            };
            notesList.appendChild(noteElement);
          });
          
          categoryElement.appendChild(notesList);
          noteDirectory.appendChild(categoryElement);
        }
      }
    })
    .catch(error => console.error('Error loading notes:', error));
}

async function saveNote() {
  const content = document.getElementById('noteTextarea').value;
  const title = content.split('\n')[0].replace('#', '').trim();
  const category = document.getElementById('noteCategory').value;
  const password = document.getElementById('notePassword').value;

  console.log('Attempting to save note:', { title, category, contentLength: content.length });

  const params = {
    FunctionName: LAMBDA_FUNCTION_NAME,
    InvocationType: "RequestResponse",
    Payload: JSON.stringify({ content, title, category, password, noteId: currentNoteId }),
  };

  try {
      const response = await new Promise((resolve, reject) => {
          lambda.invoke(params, (err, data) => {
              if (err) reject(err);
              else resolve(data);
          });
      });

      const result = JSON.parse(response.Payload);
      console.log('Lambda invocation result:', result);

      if (result.statusCode === 200) {
          loadNotes(); // Refresh the note list
          document.getElementById('noteContent').innerHTML = parseMarkdown(content);
          showViewMode();
          alert('Note saved successfully!');
          document.getElementById('notePassword').value = '';
      } else if (result.statusCode === 401) {
          alert('Incorrect password. Note not saved.');
      } else {
          const errorBody = JSON.parse(result.body);
          console.error('Detailed error:', errorBody);
          throw new Error(`Lambda invocation failed: ${errorBody.error}\nDetails: ${errorBody.details}\nStack: ${errorBody.stack}\nEvent: ${errorBody.event}`);
      }
  } catch (error) {
      console.error('Error saving note:', error);
      alert(`Failed to save note. Error: ${error.message}\n\nPlease check the console for more details.`);
  }
}

function saveEdit() {
  const title = document.getElementById('editTitle').value;
  const category = document.getElementById('editCategory').value;
  const content = document.getElementById('editTextarea').value;
  const password = document.getElementById('editPassword').value;
  const noteId = currentNote || 'note' + Date.now();

  if (!title || !content) {
      alert('Please enter both a title and content for the note.');
      return;
  }

  if (!password) {
      alert('Please enter a password to save the note.');
      return;
  }

  // const payload = { content, title, category, password, noteId };

  //   // Add console log to show all information being sent to AWS Lambda
  //   console.log('Information being sent to AWS Lambda:', {
  //       ...payload,
  //       password: '*****' // Mask the password in the console log for security
  // });

  const params = {
      FunctionName: LAMBDA_FUNCTION_NAME,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({ content, title, category, password, noteId }),
  };

  lambda.invoke(params, (err, data) => {
      if (err) {
          console.error('Error saving note:', err);
          alert('Failed to save note. Please try again.');
      } else {
          const result = JSON.parse(data.Payload);
          if (result.statusCode === 200) {
              alert('Note saved successfully!');
              currentNote = noteId;
              localStorage.setItem('currentNote', noteId);
              loadPost(noteId, 'notes');
              loadPosts('notes');
          } else if (result.statusCode === 401) {
              alert('Incorrect password. Note not saved.');
          } else {
              alert('Failed to save note. Please try again.');
          }
      }
  });
}

function backToList() {
  const currentType = localStorage.getItem('currentType') || 'blog';
  document.getElementById('postView').style.display = 'none';
  
  const containerToShow = document.getElementById(getContainerId(currentType));
  const graphView = document.getElementById(getGraphViewId(currentType));
  const isGraphVisible = currentType === 'blog' ? blogGraphVisible : notesGraphVisible;
  
  if (containerToShow && graphView) {
    if (isGraphVisible) {
      containerToShow.style.display = 'none';
      graphView.style.display = 'block';
      
      const graph = currentType === 'blog' ? blogGraph : notesGraph;
      if (graph) {
          const width = graphView.clientWidth;
          const height = graphView.clientHeight;
          graph.width(width).height(height);
      }
      const toggleSwitch = document.getElementById(getGraphViewToggleId(currentType));
      if (toggleSwitch) {
          toggleSwitch.checked = true;
      }
    } else {
      containerToShow.style.display = 'block';
      graphView.style.display = 'none';
      
      // Update the toggle switch state
      const toggleSwitch = document.getElementById(getGraphViewToggleId(currentType));
      if (toggleSwitch) {
          toggleSwitch.checked = false;
      }
    }
  } else {
      console.warn(`Some elements for ${currentType} not found`);
  }

  const toggleContainer = document.getElementById(getToggleContainerId(currentType));
  if (toggleContainer) {
      toggleContainer.style.display = 'flex';
  }

  if (currentType === 'blog') {
      currentBlogPost = null;
      localStorage.removeItem('currentBlogPost');
  } else {
      currentNote = null;
      localStorage.removeItem('currentNote');
  }
  
  if (document.getElementById('editMode').style.display == 'block') {
    toggleEditMode();
  }

  localStorage.setItem('activeSection', currentType);
  updateURL(currentType);
  applyFilter(currentFilter);
}

// Function to handle tab key in textarea
function handleTabKey(event) {
  if (event.key === 'Tab') {
      event.preventDefault();
      
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert tab character
      textarea.value = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
      
      // Move cursor to correct position
      textarea.selectionStart = textarea.selectionEnd = start + 1;
  }
}

// Function to add tab capture to a textarea
function addTabCapture(textareaId) {
  const textarea = document.getElementById(textareaId);
  if (textarea) {
      textarea.addEventListener('keydown', handleTabKey);
  } else {
      console.error(`Textarea with id ${textareaId} not found`);
  }
}
