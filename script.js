// Global variables
let currentUser = sessionStorage.getItem('currentUser');
let editingPostId = null;
let editorVisible = false;

// Safe DOM check function
function checkElements(...ids) {
    return ids.every(id => document.getElementById(id));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, currentUser:', currentUser);
    
    // Check if on dashboard without login
    if (!currentUser && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Login page setup
    if (checkElements('username', 'password', 'msg')) {
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
        return;
    }

    // Dashboard setup only if elements exist
    if (checkElements('userWelcome', 'avatar', 'blogName', 'postCount', 'postsGrid', 'editor', 'publishBtn')) {
        setupDashboard();
    }
});

// Login function (index.html)
function login() {
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const msg = document.getElementById('msg');
    
    if (!usernameEl || !passwordEl || !msg) return;
    
    const username = usernameEl.value.trim();
    const password = passwordEl.value;
    
    if (!username || !password) {
        msg.textContent = '⚠️ Please fill both fields!';
        msg.className = 'msg error';
        return;
    }
    
    try {
        // Save user credentials
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[username] = btoa(password);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Set current user
        sessionStorage.setItem('currentUser', username);
        currentUser = username;
        
        // Success message
        msg.textContent = `🎉 Welcome ${username}! Loading...`;
        msg.className = 'msg success';
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);
    } catch (error) {
        console.error('Login error:', error);
        msg.textContent = '❌ Login failed!';
        msg.className = 'msg error';
    }
}

// Dashboard initialization
function setupDashboard() {
    try {
        const userWelcome = document.getElementById('userWelcome');
        const avatar = document.getElementById('avatar');
        const blogName = document.getElementById('blogName');
        const publishBtn = document.getElementById('publishBtn');
        
        if (userWelcome) userWelcome.textContent = `Hello, ${currentUser}!`;
        if (avatar) avatar.textContent = currentUser.charAt(0).toUpperCase();
        if (blogName) blogName.textContent = `${currentUser}'s Blog`;
        if (publishBtn) publishBtn.onclick = publishOrUpdate;
        
        loadPosts();  // ✅ ONLY 1 call यहाँ
    } catch (error) {
        console.error('Dashboard setup error:', error);
    }
}

// Toggle editor visibility
function toggleEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    editorVisible = !editorVisible;
    editor.style.display = editorVisible ? 'block' : 'none';
    
    if (!editorVisible) {
        resetEditor();
    }
}

// Reset editor for new posts
function resetEditor() {
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    const publishBtn = document.getElementById('publishBtn');
    
    if (postTitle) postTitle.value = '';
    if (postContent) postContent.value = '';
    editingPostId = null;
    
    if (publishBtn) {
        publishBtn.textContent = '🚀 Publish Now';
        publishBtn.onclick = publishOrUpdate;
    }
}

// Publish new post or update existing post
function publishOrUpdate() {
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    
    if (!postTitle || !postContent) {
        alert('⚠️ Editor elements not found!');
        return;
    }
    
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    
    if (!title || !content) {
        alert('⚠️ Title and content required!');
        return;
    }
    
    try {
        let posts = JSON.parse(localStorage.getItem('posts') || '[]');
        
        if (editingPostId) {
            // Update existing post
            const index = posts.findIndex(post => post.id == editingPostId);
            if (index !== -1) {
                posts[index] = {
                    ...posts[index],
                    title: title,
                    content: content,
                    date: new Date().toISOString()
                };
                localStorage.setItem('posts', JSON.stringify(posts));
                alert('✅ Post updated successfully!');
            }
        } else {
            // Create new post
            const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            author: currentUser,
            date: new Date().toISOString(),
            isPublic: true  // ← YE LINE ADD की!
        };

            posts.unshift(newPost);
            localStorage.setItem('posts', JSON.stringify(posts));
            alert('✅ Post published successfully!');
        }
        
        // Reset and refresh
        resetEditor();
        toggleEditor();
        loadPosts();
    } catch (error) {
        console.error('Publish error:', error);
        alert('❌ Publish failed! Check console.');
    }
}

// Load and display user's posts
function loadPosts() {
    try {
        const postsGrid = document.getElementById('postsGrid');
        const postCount = document.getElementById('postCount');
        const totalViewsEl = document.getElementById('totalViews');
        
        if (!postsGrid) return;
        
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const userPosts = posts.filter(post => post.author === currentUser);
        
        // Posts count
        if (postCount) postCount.textContent = userPosts.length;
        
        // REAL VIEWS count
        if (totalViewsEl) {
            let totalViews = JSON.parse(localStorage.getItem(`views_${currentUser}`) || '0');
            totalViews = parseInt(totalViews) + userPosts.length; // +1 per post
            localStorage.setItem(`views_${currentUser}`, totalViews);
            totalViewsEl.textContent = totalViews.toLocaleString();
        }
        
        if (userPosts.length === 0) {
            postsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✨</div>
                    <h2>No posts yet!</h2>
                    <p>Create your first masterpiece and watch it shine ✨</p>
                </div>
            `;
            return;
        }
        
        postsGrid.innerHTML = userPosts.map(post => `
            <div class="post-card">
                <div class="post-title">${post.title}</div>
                <div class="post-excerpt">${post.content.substring(0, 180)}${post.content.length > 180 ? '...' : ''}</div>
                <div class="post-meta">
                <div class="post-date">
                <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 1v2h6V1h2v2h4v2H3V3h4zm-2 6v12h14V7H7z"/>
        </svg>
        ${new Date(post.date).toLocaleDateString('en-IN')}
    </div>
    <div class="button-group">
        <button class="edit-btn" onclick="editPost(${post.id})">✏️ Edit</button>
        <button class="delete-btn" onclick="deletePost(${post.id})">🗑️ Delete</button>
    </div>
</div>

                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load posts error:', error);
    }
}


// Edit post
function editPost(postId) {
    try {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const post = posts.find(p => p.id == postId);
        
        if (post) {
            const postTitle = document.getElementById('postTitle');
            const postContent = document.getElementById('postContent');
            const publishBtn = document.getElementById('publishBtn');
            
            if (postTitle) postTitle.value = post.title;
            if (postContent) postContent.value = post.content;
            editingPostId = postId;
            toggleEditor();
            
            if (publishBtn) {
                publishBtn.textContent = '💾 Update Post';
            }
        }
    } catch (error) {
        console.error('Edit error:', error);
    }
}

// Delete post
function deletePost(postId) {
    if (confirm('Delete this post? 😢')) {
        try {
            let posts = JSON.parse(localStorage.getItem('posts') || '[]');
            posts = posts.filter(post => post.id != postId);
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
}

// Logout
function logout() {
    if (confirm('Logout? 😔')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
    function updateViewsCounter() {
    const totalViewsEl = document.getElementById('totalViews');
    if (totalViewsEl) {
        let totalViews = JSON.parse(localStorage.getItem(`views_${currentUser}`) || '0');
        totalViewsEl.textContent = totalViews.toLocaleString();
    }
}

}
