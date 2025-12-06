// API Configuration
const API_URL = 'http://localhost:5000/api'; // Change to your deployed backend URL for production
// For production: const API_URL = 'https://your-backend.onrender.com/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    setupEventListeners();
});

// Update navigation based on auth status
function updateNavigation() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardLink = document.getElementById('dashboardLink');
    const userBanner = document.getElementById('userBanner');
    
    if (token && user.email) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (dashboardLink) dashboardLink.style.display = 'block';
        
        // Show user banner
        if (userBanner) {
            userBanner.style.display = 'flex';
            document.getElementById('userName').textContent = user.name || user.email;
            document.getElementById('userTier').textContent = user.subscription_tier || 'Free';
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (userBanner) userBanner.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active pane
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Analyze button
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeContent);
    }

    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.type;
            const content = btn.dataset.content;
            
            // Switch to appropriate tab
            document.querySelectorAll('.tab').forEach(tab => {
                if (tab.dataset.tab === type) {
                    tab.click();
                }
            });
            
            // Fill in the content
            if (type === 'text') {
                document.getElementById('text-input').value = content;
            } else if (type === 'url') {
                document.getElementById('url-input').value = content;
            } else if (type === 'image') {
                document.getElementById('image-input').value = content;
            }
            
            // Auto-analyze after a brief delay to let the UI update
            setTimeout(() => {
                analyzeContent();
            }, 100);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            window.location.href = 'index.html';
        });
    }

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResults);
    }

    // New analysis button
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    if (newAnalysisBtn) {
        newAnalysisBtn.addEventListener('click', () => {
            document.getElementById('results').style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Main analysis function
async function analyzeContent() {
    const btn = document.getElementById('analyze-btn');
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    
    let text = '';
    let url = '';
    let imageUrl = '';
    
    // Get input based on active tab
    if (activeTab === 'text') {
        text = document.getElementById('text-input').value.trim();
    } else if (activeTab === 'url') {
        url = document.getElementById('url-input').value.trim();
    } else if (activeTab === 'image') {
        imageUrl = document.getElementById('image-input').value.trim();
    }
    
    // Validation
    if (!text && !url && !imageUrl) {
        showError('Please provide some content to analyze');
        return;
    }
    
    // Show loading
    btn.disabled = true;
    document.querySelector('.btn-text').style.display = 'none';
    document.querySelector('.btn-loading').style.display = 'inline';
    hideError();
    
    try {
        // Prepare headers
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add auth token if logged in
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Make API request
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text, url, image_url: imageUrl })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }
        
        const data = await response.json();
        console.log('Analysis results:', data);
        displayResults(data);
        
    } catch (error) {
        showError(`Failed to analyze content: ${error.message}`);
        console.error(error);
    } finally {
        btn.disabled = false;
        document.querySelector('.btn-text').style.display = 'inline';
        document.querySelector('.btn-loading').style.display = 'none';
    }
}

// Display results
function displayResults(data) {
    // Show results section
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Display overall score
    const score = data.overall_trust_score.score;
    const grade = data.overall_trust_score.grade;
    
    document.getElementById('score-value').textContent = score;
    document.getElementById('score-grade').textContent = `Grade: ${grade}`;
    document.getElementById('recommendation').textContent = data.overall_trust_score.recommendation;
    
    const scoreCircle = document.getElementById('score-circle');
    scoreCircle.className = 'score-circle grade-' + grade.toLowerCase();
    
    // Display breakdown if available
    if (data.overall_trust_score.breakdown) {
        displayBreakdown(data.overall_trust_score.breakdown);
    }
    
    // Display individual analyses
    displayFakeNewsDetection(data.fake_news_detection);
    displaySourceValidation(data.source_validation);
    displaySentimentAnalysis(data.sentiment_analysis);
    displayBiasDetection(data.bias_detection);
    displayFactChecking(data.fact_checking);
    displayImageVerification(data.image_verification);
}

// Display score breakdown
function displayBreakdown(breakdown) {
    let html = '';
    
    if (breakdown.fake_news_score !== null && breakdown.fake_news_score !== undefined) {
        html += `
            <div class="breakdown-item">
                <div class="breakdown-label">Fake News Check</div>
                <div class="breakdown-value">${breakdown.fake_news_score}</div>
            </div>
        `;
    }
    
    if (breakdown.source_score !== null && breakdown.source_score !== undefined) {
        html += `
            <div class="breakdown-item">
                <div class="breakdown-label">Source Quality</div>
                <div class="breakdown-value">${breakdown.source_score}</div>
            </div>
        `;
    }
    
    if (breakdown.fact_check_score !== null && breakdown.fact_check_score !== undefined) {
        html += `
            <div class="breakdown-item">
                <div class="breakdown-label">Fact Check</div>
                <div class="breakdown-value">${breakdown.fact_check_score}</div>
            </div>
        `;
    }
    
    document.getElementById('score-breakdown').innerHTML = html;
}

// Display fake news detection
function displayFakeNewsDetection(data) {
    const card = document.getElementById('fake-news-card');
    const badge = document.getElementById('fake-news-badge');
    const content = document.getElementById('fake-news-content');
    
    if (!data || data.label === 'ERROR' || data.label === 'INSUFFICIENT_DATA') {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    // Set badge
    badge.textContent = data.label;
    badge.className = 'card-badge badge ' + data.risk_level.toLowerCase();
    
    // Set content
    content.innerHTML = `
        <div class="metric">
            <span class="metric-label">Prediction:</span>
            <span class="metric-value"><strong>${data.label}</strong></span>
        </div>
        <div class="metric">
            <span class="metric-label">Confidence:</span>
            <span class="metric-value">${(data.confidence * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Risk Level:</span>
            <span class="badge ${data.risk_level.toLowerCase()}">${data.risk_level}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Fake Probability:</span>
            <span class="metric-value">${(data.probabilities.FAKE * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Real Probability:</span>
            <span class="metric-value">${(data.probabilities.REAL * 100).toFixed(1)}%</span>
        </div>
    `;
}

// Display source validation
function displaySourceValidation(data) {
    const card = document.getElementById('source-card');
    const badge = document.getElementById('source-badge');
    const content = document.getElementById('source-content');
    
    if (!data) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    // Set badge
    badge.textContent = data.tier.toUpperCase();
    badge.className = 'card-badge badge ' + (data.tier === 'high' ? 'low' : data.tier === 'medium' ? 'medium' : 'high');
    
    // Warnings HTML
    let warningsHTML = '';
    if (data.warnings && data.warnings.length > 0) {
        warningsHTML = `
            <div class="warnings">
                <strong>⚠️ Warnings:</strong>
                <ul>
                    ${data.warnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="metric">
            <span class="metric-label">Domain:</span>
            <span class="metric-value">${data.domain}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Credibility Score:</span>
            <span class="metric-value">${(data.credibility_score * 100).toFixed(0)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Tier:</span>
            <span class="badge ${data.tier}">${data.tier.toUpperCase()}</span>
        </div>
        <div class="metric">
            <span class="metric-label">HTTPS:</span>
            <span class="metric-value">${data.https_enabled ? '✓ Yes' : '✗ No'}</span>
        </div>
        <div class="metric">
            <span class="metric-label">NewsAPI Verified:</span>
            <span class="metric-value">${data.newsapi_verified ? '✓ Yes' : '✗ No'}</span>
        </div>
        ${warningsHTML}
    `;
}

// Display sentiment analysis
function displaySentimentAnalysis(data) {
    const card = document.getElementById('sentiment-card');
    const badge = document.getElementById('sentiment-badge');
    const content = document.getElementById('sentiment-content');
    
    if (!data) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    // Set badge
    const manipScore = data.manipulation_score.score;
    badge.textContent = manipScore > 0.5 ? 'HIGH MANIPULATION' : manipScore > 0.3 ? 'MODERATE' : 'LOW';
    badge.className = 'card-badge badge ' + (manipScore > 0.5 ? 'high' : manipScore > 0.3 ? 'medium' : 'low');
    
    // Tactics HTML
    let tacticsHTML = '';
    if (data.manipulation_score.detected_tactics.length > 0) {
        tacticsHTML = `
            <div class="metric">
                <span class="metric-label">Tactics Detected:</span>
                <span class="metric-value">${data.manipulation_score.detected_tactics.join(', ')}</span>
            </div>
        `;
    }
    
    // Red flags HTML
    let redFlagsHTML = '';
    if (data.red_flags.length > 0) {
        redFlagsHTML = `
            <div class="warnings">
                <strong>🚩 Red Flags:</strong>
                <ul>
                    ${data.red_flags.map(flag => `<li>${flag}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="metric">
            <span class="metric-label">Manipulation Score:</span>
            <span class="metric-value">${(manipScore * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Emotional Intensity:</span>
            <span class="metric-value">${(data.emotional_intensity * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Subjectivity:</span>
            <span class="metric-value">${(data.subjectivity * 100).toFixed(0)}%</span>
        </div>
        ${tacticsHTML}
        ${redFlagsHTML}
    `;
}

// Display bias detection
function displayBiasDetection(data) {
    const card = document.getElementById('bias-card');
    const badge = document.getElementById('bias-badge');
    const content = document.getElementById('bias-content');
    
    if (!data) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    // Set badge
    badge.textContent = data.bias_level;
    badge.className = 'card-badge badge ' + data.bias_level.toLowerCase();
    
    // Biased words HTML
    let wordsHTML = '';
    if (data.biased_words_found.length > 0) {
        wordsHTML = `
            <div class="metric">
                <span class="metric-label">Biased Words:</span>
                <span class="metric-value">${data.biased_words_found.join(', ')}</span>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="metric">
            <span class="metric-label">Overall Bias:</span>
            <span class="badge ${data.bias_level.toLowerCase()}">${data.bias_level}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Bias Score:</span>
            <span class="metric-value">${(data.overall_bias_score * 100).toFixed(1)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Source Diversity:</span>
            <span class="metric-value">${(data.source_diversity * 100).toFixed(0)}%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Attribution Quality:</span>
            <span class="metric-value">${(data.attribution_score * 100).toFixed(0)}%</span>
        </div>
        ${wordsHTML}
    `;
}

// Display fact checking
function displayFactChecking(data) {
    const card = document.getElementById('fact-check-card');
    const badge = document.getElementById('fact-badge');
    const content = document.getElementById('fact-check-content');
    
    if (!data) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    // Set badge
    badge.textContent = data.overall_verification.status;
    badge.className = 'card-badge badge ' + 
        (data.overall_verification.status === 'MOSTLY_TRUE' ? 'low' : 
         data.overall_verification.status === 'MOSTLY_FALSE' ? 'high' : 'medium');
    
    // Claims HTML
    let claimsHTML = '';
    if (data.verified_claims && data.verified_claims.length > 0) {
        claimsHTML = '<div style="margin-top: 15px;"><strong>Verified Claims:</strong>';
        data.verified_claims.forEach(claim => {
            claimsHTML += `
                <div style="margin: 10px 0; padding: 10px; background: var(--bg-light); border-radius: 5px; font-size: 14px;">
                    <div><strong>Claim:</strong> ${claim.claim}</div>
                    <div style="margin-top: 5px;"><strong>Rating:</strong> ${claim.fact_check.rating}</div>
                    <div><strong>Source:</strong> ${claim.fact_check.source}</div>
                </div>
            `;
        });
        claimsHTML += '</div>';
    }
    
    content.innerHTML = `
        <div class="metric">
            <span class="metric-label">Status:</span>
            <span class="metric-value"><strong>${data.overall_verification.status}</strong></span>
        </div>
        <div class="metric">
            <span class="metric-label">Claims Found:</span>
            <span class="metric-value">${data.claims_found}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Verification Score:</span>
            <span class="metric-value">${(data.overall_verification.score * 100).toFixed(0)}%</span>
        </div>
        ${claimsHTML}
    `;
}

// Display image verification
function displayImageVerification(data) {
    const card = document.getElementById('image-card');
    const badge = document.getElementById('image-badge');
    const content = document.getElementById('image-content');
    
    if (!data) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    // Set badge
    const trustScore = data.overall_trust_score;
    badge.textContent = trustScore > 0.7 ? 'TRUSTWORTHY' : trustScore > 0.5 ? 'MODERATE' : 'SUSPICIOUS';
    badge.className = 'card-badge badge ' + (trustScore > 0.7 ? 'low' : trustScore > 0.5 ? 'medium' : 'high');
    
    // Warnings HTML
    let warningsHTML = '';
    if (data.warnings && data.warnings.length > 0) {
        warningsHTML = `
            <div class="warnings">
                <strong>⚠️ Warnings:</strong>
                <ul>
                    ${data.warnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Reverse search HTML
    let reverseHTML = '';
    if (data.reverse_search && data.reverse_search.status === 'success') {
        const sources = data.reverse_search.top_sources || [];
        reverseHTML = `
            <div class="metric">
                <span class="metric-label">Similar Images:</span>
                <span class="metric-value">${data.reverse_search.similar_images_found || 0}</span>
            </div>
            ${sources.length > 0 ? `
                <div class="metric">
                    <span class="metric-label">Found On:</span>
                    <span class="metric-value" style="font-size: 12px;">${sources.join(', ')}</span>
                </div>
            ` : ''}
        `;
    }
    
    // Manipulation HTML
    let manipHTML = '';
    if (data.manipulation_detection && !data.manipulation_detection.error) {
        const manip = data.manipulation_detection;
        manipHTML = `
            <div class="metric">
                <span class="metric-label">Manipulation Check:</span>
                <span class="badge ${manip.likely_manipulated ? 'high' : 'low'}">
                    ${manip.likely_manipulated ? 'DETECTED' : 'CLEAN'}
                </span>
            </div>
            <div class="metric">
                <span class="metric-label">Confidence:</span>
                <span class="metric-value">${manip.confidence}</span>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="metric">
            <span class="metric-label">Trust Score:</span>
            <span class="metric-value">${(trustScore * 100).toFixed(0)}%</span>
        </div>
        ${manipHTML}
        ${reverseHTML}
        ${warningsHTML}
    `;
}

// Share results
function shareResults() {
    const score = document.getElementById('score-value').textContent;
    const grade = document.getElementById('score-grade').textContent;
    const recommendation = document.getElementById('recommendation').textContent;
    
    const shareText = `TruthLens AI Analysis:\n${recommendation}\n\nTrust Score: ${score}/100 (${grade})\n\nVerify before you share! 🔍`;
    
    if (navigator.share) {
        navigator.share({
            title: 'TruthLens AI Analysis',
            text: shareText
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// Error handling
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}