import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace <a href="#login" ... > Log in </a>
# with <Link to="/login" ... > Log in </Link>

content = re.sub(r'<a\s+href="#login"([^>]*)>', r'<Link to="/login"\1>', content)
content = re.sub(r'Log in\s*</a>', r'Log in\n          </Link>', content)

with open("src/App.tsx", "w") as f:
    f.write(content)
