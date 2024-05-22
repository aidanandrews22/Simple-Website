
function formSubmit() {
    const savedSection = localStorage.getItem('activeSection') || 'about';
    alert('Thank you for your report!');
    setTimeout(() => {
        showSection(savedSection);
    }, 5000);
}
function topicPosts(category) {
    backToBlog();
    filterPosts(category);
}
function filterPosts(category) {
    const buttons = document.querySelectorAll('nav[blog] button');
    buttons.forEach(button => {
        if (button.textContent.toLowerCase() === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    const allPosts = document.querySelectorAll('#postsContainer > div[id]');
    const postsArray = Array.from(allPosts);
    postsArray.forEach(post => {
        if (category === 'all') {
            post.style.display = '';
        } else if (post.id.startsWith(category)) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });

    // Sort all visible posts by date regardless of category
    sortPosts(postsArray.filter(post => post.style.display !== 'none'));
}

function sortPosts(visiblePosts) {
    visiblePosts.sort((a, b) => {
        let dateA = parseDateFromId(a.id);
        let dateB = parseDateFromId(b.id);

        return new Date(dateB.year, dateB.month - 1, dateB.day) - new Date(dateA.year, dateA.month - 1, dateA.day);
    });

    // Re-append posts in sorted order to the specific container
    const postsContainer = document.querySelector('#postsContainer');
    visiblePosts.forEach(post => postsContainer.appendChild(post));
}

function parseDateFromId(id) {
    const dateStr = id.slice(-6); // Get the last 6 characters
    return {
        day: parseInt(dateStr.substr(0, 2), 10),
        month: parseInt(dateStr.substr(2, 2), 10),
        year: parseInt("20" + dateStr.substr(4, 2), 10) // Assuming 2000s
    };
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

function loadPost(postId) {
    fetch(`/external/blogs/${postId}.html`)
    .then(response => response.text())
    .then(html => {
        document.getElementById('postContent').innerHTML = html;
        document.getElementById('blog').style.display = 'none';
        document.getElementById('blogPost').style.display = 'block';
        localStorage.setItem('currentPost', postId);
        localStorage.setItem('activeSection', 'blogPost');
        updateURL(`blogPost/${postId}`);
    })
    .catch(error => console.error('Failed to load the post:', error));
}

function backToBlog() {
    document.getElementById('blog').style.display = 'block';
    document.getElementById('blogPost').style.display = 'none';
    localStorage.removeItem('currentPost');
    localStorage.setItem('activeSection', 'blog');
    updateURL('blog');
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
});

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


