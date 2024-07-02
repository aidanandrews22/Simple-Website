let API_GATEWAY_URL;
/* global API_GATEWAY_URL */
// Hello

document.addEventListener('DOMContentLoaded', () => {
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
  loadBlogPosts();
  handleGraphViewState();
  loadNotes();
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

function createPostElement(post) {
  const article = document.createElement('article');
  article.setAttribute('blog', 'post');
  article.id = post.id;

  article.innerHTML = `
    <a href="javascript:void(0);" onclick="loadPost('${post.id}')" blog>${post.title}</a>
    <div class="date">Written on ${formatDate(post.date)}</div>
    <div class="entry">
      <p>${post.summary}</p>
    </div>
    <a href="javascript:void(0);" onclick="loadPost('${post.id}')" read>read more</a>
  `;

  return article;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function loadPost(postId) {
    fetch('/blog-posts.json')
      .then(response => response.json())
      .then(posts => {
              const post = posts.find(p => p.id === postId);
              if (post) {
                        fetch(post.content)
                          .then(response => response.text())
                          .then(content => {
                                        document.getElementById('postContent').innerHTML = `
                                          <h1 class="post-title">${post.title}</h1>
                                            <p class="post-date">${formatDate(post.date)}</p>
                                                          ${parseMarkdown(content)}
                                                                      `;
                                                                                  document.getElementById('blog').style.display = 'none';
                                                                                              document.getElementById('blogPost').style.display = 'block';
                                        localStorage.setItem('currentPost', postId);
                                        localStorage.setItem('activeSection', 'blogPost');
                                        updateURL(`blogPost/${postId}`);
                                      })
                          .catch(error => console.error('Error loading post content:', error));
                      }
            })
      .catch(error => console.error('Error loading blog posts:', error));
}

function loadPost(postId) {
  fetch('/blog-posts.json')
    .then(response => response.json())
    .then(posts => {
      const post = posts.find(p => p.id === postId);
      if (post) {
        fetch(post.content)
          .then(response => response.text())
          .then(content => {
            document.getElementById('postContent').innerHTML = `
              <h1 class="post-title">${post.title}</h1>
              <p class="post-date">${formatDate(post.date)}</p>
              ${parseMarkdown(content)}
            `;
            document.getElementById('blog').style.display = 'none';
            document.getElementById('blogPost').style.display = 'block';
            localStorage.setItem('currentPost', postId);
            localStorage.setItem('activeSection', 'blogPost');
            updateURL(`blogPost/${postId}`);
          })
          .catch(error => console.error('Error loading post content:', error));
      }
    })
    .catch(error => console.error('Error loading blog posts:', error));
}

function filterPosts(category) {
  fetch('/blog-posts.json')
    .then(response => response.json())
    .then(posts => {
      const filteredPosts = category === 'all' ? posts : posts.filter(post => post.category === category);
      const postsContainer = document.getElementById('postsContainer');
      postsContainer.innerHTML = '';
      filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
      });

      // Update graph if it exists
      if (graph) {
        updateGraphFilter(category);
      }
    })
    .catch(error => console.error('Error filtering posts:', error));

  const buttons = document.querySelectorAll('nav[blog] button');
  buttons.forEach(button => {
    if (button.textContent.toLowerCase() === category) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function parseMarkdown(markdown) {
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gm, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2" target="_blank" rel="noopener noreferrer" alt>$1</a>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^> (.*$)/gm, '<blockquote><p>$1</p></blockquote>');

  html = html.replace(/<div align="center">\s*<img src="(.*?)" alt="(.*?)" \/>\s*<br \/>\s*<em>(.*?)<\/em>\s*<\/div>/gm, 
    '<figure class="centered-image">' +
    '<img src="$1" alt="$2" />' +
    '<figcaption>$3</figcaption>' +
    '</figure>'
  );

  html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');

  return html;
}

////////// Graph //////////////////

let graph;


function initGraph() {
    fetch('/blog-posts.json')
        .then(response => response.json())
        .then(posts => {
            const nodes = [];
            const links = [];
            
            // Add category nodes
            const categories = ['Misc', 'CS', 'ML', 'Physics'];
            categories.forEach(category => {
                nodes.push({ id: category, name: category, val: 30, group: category, isCategory: true });
            });
            
            // Add links between all category nodes
            for (let i = 0; i < categories.length; i++) {
                for (let j = i + 1; j < categories.length; j++) {
                    links.push({ 
                        source: categories[i], 
                        target: categories[j],
                        isCategoryLink: true
                    });
                }
            }
            
            // Add post nodes and links
            posts.forEach(post => {
                nodes.push({ id: post.id, name: post.title, val: 10, group: post.category, isCategory: false });
                links.push({ 
                    source: post.category, 
                    target: post.id,
                    isCategoryLink: false
                });
            });

            const graphContainer = document.getElementById('graphView');
            const width = graphContainer.clientWidth;
            const height = graphContainer.clientHeight;

            graph = ForceGraph3D()
                (graphContainer)
                .width(width)
                .height(height)
                .backgroundColor('#ffffff')
                .graphData({ nodes, links })
                .nodeId('id')
                .nodeVal(node => node.isCategory ? 30 : 10)
                .nodeLabel('name')
                .nodeColor(node => getNodeColor(node.group))
                .linkColor(link => link.isCategoryLink ? '#000000' : '#999999')
                .linkWidth(link => link.isCategoryLink ? 2 : 1)
                .linkOpacity(0.5)
                .onNodeClick(node => {
                    if (categories.includes(node.id)) {
                        filterPosts(node.id);
                    } else {
                        loadPost(node.id);
                    }
                    toggleGraphView();
                })
                .nodeVisibility(node => !node.hidden)
                .linkVisibility(link => !link.hidden)
                .enableNodeDrag(true)
                .enableNavigationControls(true)
                .showNavInfo(true);

            updateGraphFilter('all');  
            window.addEventListener('resize', handleGraphViewState);
        });
}

function toggleGraphView() {
    const postsContainer = document.getElementById('postsContainer');
    const graphView = document.getElementById('graphView');
    const graphViewToggle = document.getElementById('graphViewToggle');
    
    if (graphViewToggle.checked) {
        postsContainer.style.display = 'none';
        graphView.style.display = 'block';
        if (!graph) {
            initGraph();
        } else {
            // Update graph size when toggling view
            const width = graphView.clientWidth;
            const height = graphView.clientHeight;
            graph.width(width).height(height);
        }
    } else {
        postsContainer.style.display = 'block';
        graphView.style.display = 'none';
    }
}

function handleGraphViewState() {
    const graphViewToggle = document.getElementById('graphViewToggle');
    const graphView = document.getElementById('graphView');
    
    if (graphViewToggle.checked && graph) {
        const width = graphView.clientWidth;
        const height = graphView.clientHeight;
        graph.width(width).height(height);
    }
}

function getNodeColor(group) {
    const colors = {
        Misc: '#ff7f0e',
        CS: '#2ca02c',
        ML: '#d62728',
        Physics: '#9467bd'
    };
    return colors[group] || '#1f77b4';
}

function updateGraphFilter(category) {
  const graphData = graph.graphData();
  const nodes = graphData.nodes;
  const links = graphData.links;

  if (category === 'all') {
    // Show all nodes and links
    nodes.forEach(node => node.hidden = false);
    links.forEach(link => link.hidden = false);
  } else {
    // Hide nodes and links not in the selected category
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

  // Update graph with new data
  graph.graphData({ nodes, links });
}


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

exports.handler = async (event) => {
    const { content, title } = JSON.parse(event.body);
    const noteId = 'note' + Date.now();

    try {
        // Save the note content
        await createOrUpdateFile(`content/notes/${noteId}.md`, content, `Add new note: ${title}`);

        // Update notes.json
        const notesJson = await getFileContent('notes.json');
        notesJson.push({
            id: noteId,
            title: title,
            date: new Date().toISOString().split('T')[0],
            category: 'General'
        });
        await createOrUpdateFile('notes.json', JSON.stringify(notesJson, null, 2), `Update notes.json for new note: ${title}`);

        return {
          statusCode: 200,
          headers: {
              "Access-Control-Allow-Origin": "*", // Or your specific domain
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "POST, OPTIONS"
          },
          body: JSON.stringify({ message: "Note saved successfully" }),
      };
  } catch (error) {
      console.error('Error saving note:', error);
      return {
          statusCode: 500,
          headers: {
              "Access-Control-Allow-Origin": "*", // Or your specific domain
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "POST, OPTIONS"
          },
          body: JSON.stringify({ error: "Failed to save note" }),
      };
  }
};

function createNewNote() {
  document.getElementById('noteContent').value = '# New Note\n\nEnter your note content here...';
}

async function saveNote() {
  const content = document.getElementById('noteContent').value;
  const title = content.split('\n')[0].replace('#', '').trim(); // Use first line as title

  try {
      const response = await fetch(API_GATEWAY_URL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
          throw new Error('Failed to save note');
      }

      const result = await response.json();
      console.log(result.message);
      loadNotes(); // Reload the notes list
  } catch (error) {
      console.error('Error saving note:', error);
  }
}

function loadNotes() {
  fetch('/notes.json')
      .then(response => response.json())
      .then(notes => {
          const noteDirectory = document.getElementById('noteDirectory');
          noteDirectory.innerHTML = '';
          notes.forEach(note => {
              const noteElement = document.createElement('div');
              noteElement.textContent = note.title;
              noteElement.onclick = () => loadNote(note.id);
              noteDirectory.appendChild(noteElement);
          });
      })
      .catch(error => console.error('Error loading notes:', error));
}

function loadNote(noteId) {
  fetch(`/content/notes/${noteId}.md`)
      .then(response => response.text())
      .then(content => {
          document.getElementById('noteContent').value = content;
      })
      .catch(error => console.error('Error loading note:', error));
}
