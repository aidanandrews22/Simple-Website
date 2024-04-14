
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
    localStorage.setItem('currentCategory', category);
    const categories = ['misc', 'bio', 'ml', 'physics']; // List all categories here
    const allDivs = document.querySelectorAll('.post-container'); // Targets all category divs

    if (category === 'all') {
        allDivs.forEach(div => div.style.display = ''); // Show all
    } else {
        allDivs.forEach(div => {
            div.style.display = div.classList.contains(category) ? '' : 'none'; // Show selected category only
        });
    }
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
    })
    .catch(error => console.error('Failed to load the post:', error));
}
function backToBlog() {
    document.getElementById('blog').style.display = 'block';
    document.getElementById('blogPost').style.display = 'none';
    localStorage.removeItem('currentPost');
    localStorage.setItem('activeSection', 'blog');
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
        iframe.src = 'assets/PDF/Aidan Andrews Winter Transcript.pdf';
        unofficialLink.classList.remove('active');
        officialLink.classList.add('active');
    }
}
function showSection(sectionId) {
    localStorage.removeItem('currentPost');
    var sections = document.querySelectorAll('#content > section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    var activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    } else {
        console.error('Section with ID ' + sectionId + ' not found.');
    }
    localStorage.setItem('activeSection', sectionId);
    updateActiveLink(sectionId);
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

document.addEventListener('DOMContentLoaded', () => {
    const currentCategory = localStorage.getItem('currentCategory') || 'all';
    const savedSection = localStorage.getItem('activeSection') || 'about';
    const currentPost = localStorage.getItem('currentPost');
    // console.log('Current Post:', currentPost);
    // console.log('Saved Section:', savedSection);
    filterPosts(currentCategory);
    if (currentPost) {
        loadPost(currentPost);
    }
    showSection(savedSection);

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(sectionId);
            event.preventDefault();
        });
    });
});