import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

type Status = "stable" | "beta" | "experimental" | "deprecated";

type Props = {
  title?: string;

  pkg?: string;
  className?: string;

  // Static Javadoc path served from /static
  javadocPath?: string; // "/lib/javadoc/....html"

  // GitHub source link:
  // - easiest: pass the java source path relative to repo root OR relative to srcRoot (see below)
  sourcePath?: string;
  sourcePathIsRepoRoot?: boolean; // default false = relative to srcRoot

  // Extra
  since?: string;
  status?: Status;

};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.55rem",
        borderRadius: 999,
        border: "1px solid var(--ifm-toc-border-color)",
        fontSize: "0.8rem",
        marginInlineEnd: 8,
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );
}

export default function DocHeader(props: Props) {
  const { siteConfig } = useDocusaurusContext();

  const {owner, repo, branch, srcRoot} = siteConfig.customFields.github as {
    owner: string;
    repo: string;
    branch: string;
    srcRoot?: string;
  };

  const {
    title,
    pkg,
    className,
    javadocPath,
    sourcePath,
    sourcePathIsRepoRoot = false,
    since,
    status,
  } = props;

  const javadocHref = javadocPath ? useBaseUrl(javadocPath) : null;
  const isHtml = !!javadocHref && javadocHref.endsWith(".html");
  
  let githubUrl: string | null = null;
  if (owner && repo && branch && sourcePath) {
    const path = sourcePathIsRepoRoot ? sourcePath : `${srcRoot}${sourcePath}`;
    githubUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${path}`;
  }

  return (
    <div
      style={{
        border: "1px solid var(--ifm-toc-border-color)",
        borderRadius: 16,
        padding: "1rem",
        marginBottom: "1rem",
        background: "var(--ifm-background-surface-color)",
      }}
    >
      {title && <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{title}</h2>}

      <div style={{ marginBottom: 10 }}>
        {status && <Badge>מצב: {{ stable: "יציב", beta: "בטא", experimental: "ניסיוני", deprecated: "הוצא משימוש" }[status]}</Badge>}
        {since && <Badge>החל מגרסה: {since}</Badge>}
      </div>

      <div style={{ lineHeight: 1.6 }}>
        {pkg && (
          <div>
            <b>חבילה:</b> <code>{pkg}</code>
          </div>
        )}
        {className && (
          <div>
            <b>מחלקה:</b> <code>{className}</code>
          </div>
        )}

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {javadocHref && isHtml ? (
            <a href={javadocHref} target="_blank" rel="noopener noreferrer">
                Javadoc
            </a>
            ) : javadocHref ? (
            <Link to={javadocHref} target="_blank" rel="noopener noreferrer">
                Javadoc
            </Link>
            ) : null}
          {githubUrl && (
            <Link to={githubUrl} target="_blank" rel="noopener noreferrer">
              צפייה בקוד המקור ב־GitHub
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
