document.addEventListener('DOMContentLoaded', function() {
    loadPublicBlogs();
});

function loadPublicBlogs() {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const publicPosts = posts.filter(post => post.isPublic !== false); // सभी posts public
    
    const container = document.getElementById('blogsGrid');
    
    if (publicPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌐</div>
                <h2>No public blogs yet!</h2>
                <p>Blog owners need to publish posts first</p>
            </div>
        `;
        return;
    }
    
    // Author-wise group
    const blogsByAuthor = {};
    publicPosts.forEach(post => {
        if (!blogsByAuthor[post.author]) {
            blogsByAuthor[post.author] = [];
        }
        blogsByAuthor[post.author].push(post);
    });
    
    container.innerHTML = Object.entries(blogsByAuthor).map(([author, posts]) => `
        <div class="blog-card">
            <div class="blog-header">
                <div class="blog-avatar">${author.charAt(0).toUpperCase()}</div>
                <div>
                    <h3>${author}'s Blog</h3>
                    <span class="post-count">${posts.length} posts</span>
                </div>
            </div>
            <div class="recent-posts">
                ${posts.slice(0, 3).map(post => `
                    <div class="post-preview">
                        <h4>${post.title}</h4>
                        <p>${post.content.substring(0, 100)}...</p>
                        <span>📅 ${new Date(post.date).toLocaleDateString('en-IN')}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}
