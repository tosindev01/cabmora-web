import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace <h1, <h2, <h3 classes to include font-serif
content = re.sub(r'<h1([^>]*)className="([^"]*)"', r'<h1\1className="font-serif \2"', content)
content = re.sub(r'<h2([^>]*)className="([^"]*)"', r'<h2\1className="font-serif \2"', content)
content = re.sub(r'<h3([^>]*)className="([^"]*)"', r'<h3\1className="font-serif \2"', content)

# Remove the inline styles
content = content.replace('style={{ fontFamily: "\'Playfair Display\', serif" }}', '')
content = content.replace('style={{ fontFamily: "\'Playfair Display\', serif" }}\n', '')
content = content.replace(' style={{ fontFamily: "\'Playfair Display\', serif" }}\n', '\n')
content = content.replace(' style={{ fontFamily: "\'Playfair Display\', serif" }}', '')

with open("src/App.tsx", "w") as f:
    f.write(content)
