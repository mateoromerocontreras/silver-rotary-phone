---
layout: post
title: My New Post
date: 2024-08-22 12:44 -0300
categories: [Blogging, Demo]
tags: [TAG]     # TAG names should always be lowercase
description: Short summary of the post.
---
Table of Contents
By default, the Table of Contents (TOC) is displayed on the 
right panel of the post. If you want to turn it off globally,
go to _config.yml and set the value of variable toc to false. 
If you want to turn off TOC for a specific post, add the following 
to the post’s Front Matter:

> Example line for prompt.
{: .prompt-info }

`inline code part`

`/path/to/a/file.extend`{: .filepath}

```
This is a plaintext code snippet.
```

```shell
echo 'No more line numbers!'
```
{: .nolineno }

```shell
# content
```
{: file="path/to/file" }

{% raw %}
```liquid
{% if product.title contains 'Pack' %}
  This product's title contains the word Pack.
{% endif %}
```
{% endraw %}

## Mathematics

We use [**MathJax**][mathjax] to generate mathematics. For website performance reasons, the mathematical feature won't be loaded by default. But it can be enabled by:

[mathjax]: https://www.mathjax.org/

```yaml
---
math: true
---
```

Then you can write mathematics in your post like this:

```latex
$$
\begin{align*}
  a & = b^2 + c \\
  x & = y - z
\end{align*}
$$
```

---
math: false
---
## Footnotes

Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they belong to the previous footnote.

    The whole paragraph can be indented, or just the first line. In this way, multi-paragraph footnotes work like multi-paragraph list items.

## Citations

We use [**BibTeX**][bibtex] to generate citations. For website performance reasons, the citation feature won't be loaded by default. But it can be enabled by:

[bibtex]: http://www.bibtex.org/

```yaml
---
bibliography: [path/to/your.bib]
---
```

Then you can write citations in your post like this:

```latex
[@bibtexkey]
```

``
[@bibtexkey]
``
{: .citation}

## Code Highlighting

We use [**Rouge**][rouge] to highlight code. You can specify the language of the code block for syntax highlighting. For example:

[rouge]: http://rouge.jneen.net/

```shell
echo 'Hello, World!'
```

```python
print('Hello, World!')
```

```ruby
puts 'Hello, World!'
```

```javascript
console.log('Hello, World!');
```

```html
<h1>Hello, World!</h1>
```

```css
h1 {
  color: #333;
}
```

```yaml
key: value
```

```json
{
  "key": "value"
}
```

```plaintext
This is a plaintext code snippet.
```

## Tables

We use [**Jekyll Table of Contents**][jekyll-toc] to generate tables. For website performance reasons, the table feature won't be loaded by default. But it can be enabled by:

[jekyll-toc]:

```yaml
---
toc: true
---
```

Then you can write tables in your post like this:

```markdown
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
```

``
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
``
{: .table}

## Alerts

We use [**Bootstrap**][bootstrap] to generate alerts. You can specify the type of the alert. For example:
