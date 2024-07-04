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

document.addEventListener('DOMContentLoaded', () => {
  initializeMarked();
  clearLocalStorageAfterDelay();
  handleNavigation();

  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
      link.addEventListener('click', function(event) {
          const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
          showSection(sectionId);
          event.preventDefault();
      });
  });
  loadPosts('blog');
  loadPosts('notes');
});

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

function showSection(sectionId) {
    localStorage.removeItem('currentPost');
    const sections = document.querySelectorAll('#content > section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    } else {
        console.error('Section with ID ' + sectionId + ' not found.');
    }
    if (sectionId !== 'report') localStorage.setItem('activeSection', sectionId);
    updateActiveLink(sectionId);
    updateURL(sectionId);
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
    localStorage.removeItem('currentPost');
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const sectionName = link.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (sectionName === activeSectionId) {
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


window.addEventListener('popstate', (event) => {
    handleNavigation();
});

function handleNavigation() {
    const pathSegments = window.location.pathname.split('/').filter(segment => segment);
    const sectionId = pathSegments[0];
    const postId = pathSegments[1];

    if (sectionId === 'blogPost' && postId) {
        loadPost(postId);
    } else if (sectionId) {
        showSection(sectionId);
    } else {
        const savedSection = localStorage.getItem('activeSection') || 'about';
        showSection(savedSection);
    }

    const currentCategory = localStorage.getItem('currentCategory') || 'all';
    filterPosts(currentCategory);
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
  const blogUrl = '/blog-posts.json';
  const notesUrl = '/notes.json';
  
  Promise.all([
    fetch(blogUrl).then(response => response.json()),
    fetch(notesUrl).then(response => response.json())
  ])
  .then(([blogPosts, notes]) => {
    const container = document.getElementById(type === 'blog' ? 'blogPostsContainer' : 'notesContainer');
    if (container) {
      container.innerHTML = '';
      if (type === 'blog') {
        blogPosts.forEach(post => {
          const postElement = createPostElement(post, 'blog');
          container.appendChild(postElement);
        });
      } else {
        notes.forEach(note => {
          const noteElement = createPostElement(note, 'note');
          container.appendChild(noteElement);
        });
      }
      initGraph(type, blogPosts, notes);
    } else {
      console.error(`Container for ${type} not found`);
    }
  })
  .catch(error => console.error(`Error loading ${type}:`, error));
}

function loadPost(postId, type) {
  if (!postId) {
      console.error('No post ID provided');
      return;
  }

  const url = type === 'blog' ? '/blog-posts.json' : '/notes.json';
  fetch(url)
      .then(response => response.json())
      .then(posts => {
          const post = posts.find(p => p.id === postId);
          if (post) {
              console.log('Found post:', post);  // Debug log
              let contentPromise;
              if (type === 'blog') {
                  contentPromise = fetch(post.content).then(response => response.text());
              } else {
                  // For notes, fetch the content from a separate file
                  contentPromise = fetch(`/content/notes/${post.id}.md`).then(response => response.text());
              }

              contentPromise.then(content => {
                  console.log('Raw content:', content);  // Debug log
                  const parsedContent = parseMarkdown(content);
                  console.log('Parsed content:', parsedContent);  // Debug log
                  const postContent = document.getElementById('postContent');
                  if (postContent) {
                      postContent.innerHTML = `
                          <h1 class="post-title">${post.title.replace(/^#+\s/, '')}</h1>
                          <p class="post-date">${formatDate(post.date)}</p>
                          <div class="parsed-content">${parsedContent}</div>
                      `;
                      
                      // Hide the appropriate container based on the type
                      const containerToHide = document.getElementById(type === 'blog' ? 'blogPostsContainer' : 'notesContainer');
                      if (containerToHide) {
                          containerToHide.style.display = 'none';
                      } else {
                          console.warn(`Container for ${type} not found`);
                      }

                      const postView = document.getElementById('postView');
                      if (postView) {
                          postView.style.display = 'block';
                      } else {
                          console.error('Post view container not found');
                      }

                      const editButton = document.getElementById('editButton');
                      if (editButton) {
                          editButton.style.display = type === 'note' ? 'block' : 'none';
                      }

                      const toggleContainerId = type === 'blog' ? 'blogToggleContainer' : 'notesToggleContainer';
                      const toggleContainer = document.getElementById(toggleContainerId);
                      if (toggleContainer) {
                          toggleContainer.style.display = 'none';
                      }

                      localStorage.setItem('currentPost', postId);
                      localStorage.setItem('activeSection', 'postView');
                      localStorage.setItem('currentType', type);
                      updateURL(`${type}/${postId}`);
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
  const url = type === 'blog' ? '/blog-posts.json' : '/notes.json';
  fetch(url)
      .then(response => response.json())
      .then(posts => {
          const filteredPosts = category === 'all' ? posts : posts.filter(post => post.category === category);
          const container = document.getElementById(type === 'blog' ? 'blogPostsContainer' : 'notesContainer');
          container.innerHTML = '';
          filteredPosts.forEach(post => {
              const postElement = createPostElement(post, type);
              container.appendChild(postElement);
          });

          // Update graph if it exists
          if (type === 'blog' && blogGraph) {
              updateGraphFilter(category, 'blog');
          } else if (type === 'notes' && notesGraph) {
              updateGraphFilter(category, 'notes');
          }
      })
      .catch(error => console.error('Error filtering posts:', error));

  const buttons = document.querySelectorAll(`nav[${type}] button`);
  buttons.forEach(button => {
      if (button.textContent.toLowerCase() === category.toLowerCase()) {
          button.classList.add('active');
      } else {
          button.classList.remove('active');
      }
  });
}

////////// Graph //////////////////

let blogGraph;
let notesGraph;


function initGraph(type, posts, notes) {
  const graphContainer = document.getElementById(`${type}GraphView`);
  if (!graphContainer) {
      console.error(`Graph container for ${type} not found`);
      return;
  }

  const width = graphContainer.clientWidth;
  const height = graphContainer.clientHeight;

  const nodes = [];
  const links = [];
  
  // Add category nodes for blog posts
  const blogCategories = ['Misc', 'CS', 'ML', 'Physics'];
  blogCategories.forEach(category => {
      nodes.push({ id: `blog-${category}`, name: category, val: 30, group: category, isCategory: true, type: 'blog' });
  });
  
  // Add category nodes for notes
  const noteCategories = ['School', 'Work', 'Misc', 'Personal'];
  noteCategories.forEach(category => {
      nodes.push({ id: `note-${category}`, name: category, val: 30, group: category, isCategory: true, type: 'note' });
  });
  
  // Add links between all blog category nodes
  for (let i = 0; i < blogCategories.length; i++) {
      for (let j = i + 1; j < blogCategories.length; j++) {
          links.push({ 
              source: `blog-${blogCategories[i]}`, 
              target: `blog-${blogCategories[j]}`,
              isCategoryLink: true,
              type: 'blog'
          });
      }
  }
  
  // Add links between all note category nodes
  for (let i = 0; i < noteCategories.length; i++) {
      for (let j = i + 1; j < noteCategories.length; j++) {
          links.push({ 
              source: `note-${noteCategories[i]}`, 
              target: `note-${noteCategories[j]}`,
              isCategoryLink: true,
              type: 'note'
          });
      }
  }
  
  // Add blog post nodes and links
  posts.forEach(post => {
      if (post.category && blogCategories.includes(post.category)) {
          nodes.push({ id: `blog-${post.id}`, name: post.title, val: 10, group: post.category, isCategory: false, type: 'blog' });
          links.push({ 
              source: `blog-${post.category}`, 
              target: `blog-${post.id}`,
              isCategoryLink: false,
              type: 'blog'
          });
      }
  });

  // Add note nodes and links
  notes.forEach(note => {
      if (note.category && noteCategories.includes(note.category)) {
          nodes.push({ id: `note-${note.id}`, name: note.title, val: 10, group: note.category, isCategory: false, type: 'note' });
          links.push({ 
              source: `note-${note.category}`, 
              target: `note-${note.id}`,
              isCategoryLink: false,
              type: 'note'
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
          toggleGraphView(node.type);
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
  const postsContainer = document.getElementById(type === 'blog' ? 'blogPostsContainer' : 'notesContainer');
  const graphView = document.getElementById(`${type}GraphView`);
  const graphViewToggle = document.getElementById(`${type}GraphViewToggle`);
  
  if (graphViewToggle && graphView && postsContainer) {
      if (graphViewToggle.checked) {
          postsContainer.style.display = 'none';
          graphView.style.display = 'block';
          const graph = type === 'blog' ? blogGraph : notesGraph;
          if (graph) {
              const width = graphView.clientWidth;
              const height = graphView.clientHeight;
              graph.width(width).height(height);
          } else {
              loadPosts(type);  // This will initialize the graph if it doesn't exist
          }
      } else {
          postsContainer.style.display = 'block';
          graphView.style.display = 'none';
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

let currentNoteId = null;
let markedInstance = null;

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
    if (typeof marked !== 'undefined') {
        markedInstance = new marked.Marked();
        console.log('Marked initialized successfully');
    } else {
        console.error('Marked library not found');
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

      // Check for checkbox syntax
      const checkboxMatch = text.match(/^\s*\[([ x])\]\s*(.*)$/i);
      if (checkboxMatch || task) {
          const isChecked = (checkboxMatch && checkboxMatch[1].toLowerCase() === 'x') || checked;
          const itemText = checkboxMatch ? checkboxMatch[2] : text;
          return `
              <li class="task-list-item">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} disabled />
                  <span>${itemText}</span>
              </li>
          `;
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
    const editTextarea = document.getElementById('editTextarea');

    if (editMode.style.display === 'none') {
        // Switching to edit mode
        editTextarea.value = viewMode.innerText;
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
    } else {
        // Switching to view mode
        viewMode.innerHTML = parseMarkdown(editTextarea.value);
        editMode.style.display = 'none';
        viewMode.style.display = 'block';
    }
}

function showViewMode() {
  document.getElementById('noteViewMode').style.display = 'block';
  document.getElementById('noteEditMode').style.display = 'none';
}

function createNewNote() {
  const title = prompt("Enter a title for your new note:");
  if (!title) return; // Cancel if no title is entered

  const category = prompt("Enter a category for your note:");
  if (!category) return; // Cancel if no category is entered

  currentNoteId = null; // Reset current note ID
  document.getElementById('noteTextarea').value = `# ${title}\n\nEnter your note content here...`;
  document.getElementById('noteCategory').value = category;
  toggleEditMode(); // Switch to edit mode
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
      notes.forEach(note => {
        if (!categories[note.category]) {
          categories[note.category] = [];
        }
        categories[note.category].push(note);
      });

      for (const [category, categoryNotes] of Object.entries(categories)) {
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
  const content = document.getElementById('editTextarea').value;
  const password = document.getElementById('editPassword').value;
  const postId = localStorage.getItem('currentPost');

  const params = {
      FunctionName: LAMBDA_FUNCTION_NAME,
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({ content, postId, password }),
  };

  lambda.invoke(params, (err, data) => {
      if (err) {
          console.error('Error saving note:', err);
          alert('Failed to save note. Please try again.');
      } else {
          const result = JSON.parse(data.Payload);
          if (result.statusCode === 200) {
              alert('Note saved successfully!');
              document.getElementById('postContent').innerHTML = parseMarkdown(content);
              toggleEditMode();
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
  const containerToShow = document.getElementById(currentType === 'blog' ? 'blogPostsContainer' : 'notesContainer');
  if (containerToShow) {
      containerToShow.style.display = 'block';
  } else {
      console.warn(`Container for ${currentType} not found`);
  }
  const toggleContainerId = currentType === 'blog' ? 'blogToggleContainer' : 'notesToggleContainer';
  const toggleContainer = document.getElementById(toggleContainerId);
  if (toggleContainer) {
      toggleContainer.style.display = 'flex';
  }
  localStorage.removeItem('currentPost');
  localStorage.setItem('activeSection', currentType);
  updateURL(currentType);
}