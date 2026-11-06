import subprocess, pathlib
subprocess.run(["npx","esbuild","src/main.jsx","--bundle","--minify","--format=iife","--define:process.env.NODE_ENV=\"production\"","--outfile=dist/app.js","--jsx=automatic","--loader:.js=jsx"],check=True)
js=pathlib.Path("dist/app.js").read_text().replace("</script","<\\/script")
css=pathlib.Path("src/style.css").read_text()
head='''<title>MPW NEXUS AI</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap">
'''
frag=head+f"<style>\n{css}\n</style>\n<div id=\"root\"></div>\n<script>\n{js}\n</script>\n"
pathlib.Path("dist/mpw-nexus-ai.html").write_text(frag)
full='<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+head+f"<style>\n{css}\n</style>\n</head>\n<body>\n<div id=\"root\"></div>\n<script>\n{js}\n</script>\n</body>\n</html>\n"
pathlib.Path("dist/standalone.html").write_text(full)
print(len(frag))
