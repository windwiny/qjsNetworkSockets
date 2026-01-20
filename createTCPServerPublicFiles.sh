#!/bin/bash

# Script to create test files for static file serving

echo "Creating public/ directory structure..."

# Create directories
mkdir -p public
mkdir -p public/assets

# Create test.html
cat > public/test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Static Test Page</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <h1>Static File Test</h1>
    <p>This is a test HTML file served from the public/ directory.</p>
    <p>If you can see this, static file serving is working!</p>
    <script src="/script.js"></script>
</body>
</html>
EOF

# Create style.css
cat > public/style.css << 'EOF'
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
}

p {
    color: #34495e;
    line-height: 1.6;
}
EOF

# Create script.js
cat > public/script.js << 'EOF'
console.log('Static JavaScript file loaded successfully!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - static file serving works!');
});
EOF

# Create data.json
cat > public/data.json << 'EOF'
{
  "message": "Static JSON file served successfully",
  "status": "ok",
  "features": [
    "JSON serving",
    "Correct MIME type",
    "UTF-8 encoding"
  ]
}
EOF

# Create readme.txt
cat > public/readme.txt << 'EOF'
This is a plain text file served from the public/ directory.

Static file serving features:
- Automatic MIME type detection
- Support for subdirectories
- Multiple file types (HTML, CSS, JS, JSON, images, etc.)
- Proper Content-Type headers
EOF

# Create a simple placeholder image (1x1 transparent PNG)
# Base64 encoded 1x1 transparent PNG
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > public/assets/logo.png

echo ""
echo "✓ Created public/test.html"
echo "✓ Created public/style.css"
echo "✓ Created public/script.js"
echo "✓ Created public/data.json"
echo "✓ Created public/readme.txt"
echo "✓ Created public/assets/logo.png"
echo ""
echo "Public directory structure:"
tree public/ 2>/dev/null || find public -type f

echo ""
echo "You can now test static file serving with:"
echo "  curl http://127.0.0.1:8080/test.html"
echo "  curl http://127.0.0.1:8080/style.css"
echo "  curl http://127.0.0.1:8080/script.js"
echo "  curl http://127.0.0.1:8080/data.json"
echo "  curl http://127.0.0.1:8080/readme.txt"
echo "  curl http://127.0.0.1:8080/assets/logo.png"
