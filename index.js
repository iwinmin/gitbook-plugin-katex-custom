const path = require('path');
const fs = require('fs');
var Katex = null;
const OUTPUT_PATH = 'gitbook/gitbook-plugin-katex-custom';

function getConfig(context, property, defaultValue) {
    var config = context.config ? /* 3.x */ context.config : /* 2.x */ context.book.config;
    return config.get('pluginsConfig.katex-custom.'+property, defaultValue);
}

const STAT = {
    require: false,
    has_block: false
};

module.exports = {
    hooks: {
        init: function() {
            try {
                // custom the katex plugin name or path
                let katex_path = getConfig(this, 'katex', 'katex');
                if (katex_path != 'katex') {
                    this.log.info.ln('Use module <%s> as katex', katex_path);
                }
                STAT.css = getConfig(this, 'css', ['katex.min.css']);
                Katex = require(katex_path);
            } catch (e) {
                this.log.error.ln('Module <katex> not found. please install first!');
            }
        },
        finish: function() {
            if (STAT.require) {
                // copy assets file to output
                let katex_path = getConfig(this, 'katex', 'katex');
                let paths = getConfig(this, 'resources', ['katex.min.css', 'fonts']);

                let node_id = require.resolve(katex_path);
                let dist_path = path.dirname(node_id);

                let root = this.output.resolve(OUTPUT_PATH);
                fs.mkdirSync(root);

                for (let res_path of paths) {
                    let src = path.join(dist_path, res_path);
                    let dst = path.join(root, res_path);

                    // create file parent folder
                    let dirs = res_path.split(/[\\/]+/);
                    for (let i=1; i<dirs.length; i++) {
                        try {
                            fs.mkdirSync(path.join(root, ...dirs.slice(0, i)));
                        } catch (err) {}
                    }

                    if (fs.statSync(src).isFile()) {
                        // copy signle file
                        fs.copyFileSync(src, dst);
                    }
                    else {
                        // copy folder, but just zhe first level file
                        fs.mkdirSync(dst);
                        let files = fs.readdirSync(src, {withFileTypes: true});
                        for (let it of files) {
                            if (it.isFile()) {
                                let file = it.name;
                                fs.copyFileSync(src + '/' + file, dst + '/' + file);
                            }
                        }
                    }
                }
            }
        },
        page: async function(page) {
            if (STAT.has_block) {
                STAT.has_block = false;
                let base = path.dirname(page.path);
                for (let file of STAT.css) {
                    file = path.relative(base, OUTPUT_PATH + '/' + file);
                    page.content = `<link rel="stylesheet" href="${file}">\n${page.content}`;
                }
            }
            return page;
        }
    },
    blocks: {
        math: {
            shortcuts: {
                parsers: ["markdown", "asciidoc", "restructuredtext"],
                start: "$$",
                end: "$$"
            },
            process: function(blk) {
                let output = blk.body;
                let isInline = !(output[0] == "\n");
                if (Katex) {
                    STAT.require = true;
                    STAT.has_block = true;

                    return Katex.renderToString(output, {
                        displayMode: !isInline
                    });
                }
                else if (isInline) {
                    return '<code>' + output + '</code>';
                } else {
                    return '<pre>' + output + '</pre>';
                }
            }
        }
    }
};