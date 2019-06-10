Math typesetting using KaTex
==============

Use it for your book, by adding to your book.json:

```json
{
    "plugins": ["katex"]
}
```

then run `gitbook install`.

and install the latest Katex module to youre project folder.

`npm install katex`.

Usage
-----

```markdown
Inline math: $$\int_{-\infty}^\infty g(x) dx$$


Block math:

$$
\int_{-\infty}^\infty g(x) dx
$$

Or using the templating syntax:

{% math %}\int_{-\infty}^\infty g(x) dx{% endmath %}
```

Comparison with [Katex](https://github.com/GitbookIO/plugin-katex)
----------------------------------------------------------------------

- can use the latest Katex nodejs module
