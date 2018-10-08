import { ExtractedRepoSlug } from "@r2c/extension/utils";
import { Range } from "monaco-editor";
import * as React from "react";
import MonacoEditor, { EditorDidMount } from "react-monaco-editor";
import "./LandingModal.css";

const snippet = `var exec = require('child_process').exec;

module.exports = function (iface, callback) {
    exec("ifconfig " + iface, function (err, out) {
        if (err) {
            callback(err, null);
            return;
        }
        var match = /[a-f0-9]{2}(:[a-f0-9]{2}){5}/.exec(out.toLowerCase());
        if (!match) {
            callback("did not find a mac address", null);
            return;
        }
        callback(null, match[0].toLowerCase());
    });
};`;

interface LandingModalProps {
  content?: string;
  repoSlug?: ExtractedRepoSlug;
  filename?: string;
}

export default class LandingModal extends React.PureComponent<
  LandingModalProps
> {
  private editor = React.createRef<MonacoEditor>();

  public render() {
    const {
      content = snippet,
      repoSlug = {
        domain: "github.com",
        org: "scravy",
        repo: "node-macaddress"
      },
      filename = "lib/linux.js"
    } = this.props;

    return (
      <section className="pf-landing-modal">
        <header className="pf-landing-header">
          <div className="snippet-source">
            <div className="snippet-source-domain">{repoSlug.domain}</div>
            <div className="source-domain-slug">
              <span className="snippet-source-profile">{repoSlug.org}</span>/
              <span className="snippet-source-repo">{repoSlug.repo}</span>
            </div>
          </div>
          <div className="snippet-filename">{filename}</div>
          <div className="snippet-finding-meta" />
        </header>
        <article className="pf-snippet">
          <MonacoEditor
            value={content}
            ref={this.editor}
            editorDidMount={this.editorDidMount}
            options={{
              readOnly: true,
              fontSize: 16,
              glyphMargin: true,
              minimap: {
                enabled: false
              },
              folding: false,
              scrollBeyondLastLine: false
            }}
          />
        </article>
        <aside className="pf-engage" />
      </section>
    );
  }

  private editorDidMount: EditorDidMount = editor => {
    editor.revealLineInCenter(4);
    editor.deltaDecorations(
      [],
      [
        {
          range: new Range(4, 1, 4, 1),
          options: {
            isWholeLine: true,
            className: "snippet-line-highlight",
            glyphMarginClassName: "snippet-glyph-margin-highlight"
          }
        }
      ]
    );
  };
}
