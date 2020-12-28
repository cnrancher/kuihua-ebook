import React from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";

const description =
    "嘿嘿嘿，该葵花宝典为内部使用，由Rancher中国全体人员维护，内容涵盖一些常见的故障处理，故障排查方法，一些解决方案等等内容，内容持续更新，欢迎大家踊跃贡献，共同打造亚洲最大Rancher解决方案知识库";
const keywords = ["葵花宝典", "故障处理", "亚洲最大", "解决方案"];
const metaTitle = "解决方案 | 葵花宝典 | Rancher";
function findAndAppendSubGroups(all, metadata, baseUrl, subItems) {
    subItems.forEach((sub) => {
        if (typeof sub === "string") {
            const label = metadata.docs.troubleshooting[sub];
            if (label) {
                all.push({
                    label,
                    key: baseUrl + "docs/" + sub,
                });
            }
        } else if (sub.items) {
            findAndAppendSubGroups(all, metadata, baseUrl, sub.items);
        }
    });
}

function getToc(sidebars, metadata, baseUrl) {
    const out = [];
    const docs = sidebars.troubleshooting;
    Object.keys(docs).forEach((categoryKey) => {
        const allSubGroups = [];
        findAndAppendSubGroups(
            allSubGroups,
            metadata,
            baseUrl,
            docs[categoryKey]
        );
        const description = metadata.categories.troubleshooting[categoryKey];
        if (description) {
            out.push({
                key: categoryKey,
                description,
                subGroups: allSubGroups,
            });
        }
    });
    return out;
}

function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;
    const { baseUrl } = siteConfig;
    const { sidebars, metadata } = siteConfig.customFields;
    const toc = getToc(sidebars, metadata, baseUrl);
    const title = "Rancher 中文文档";
    return (
        <Layout title={metaTitle} description={description} keywords={keywords}>
            <header className={classnames("hero", styles.heroBanner)}>
                <div className="container">
                    <img
                        className="hero__logo"
                        src="/img/rancher-logo-stacked-black.svg"
                    />
                    <p className="hero__subtitle navigation__subtitle">
                        {title}
                    </p>
                </div>
            </header>
            <main>
                <div className="navigation__grid">
                    <div className="navigation__item">
                        <div className="navigation__title">
                            <a href="https://ebook.rancher.cn/troubleshooting/">
                                <h1>故障处理</h1>
                            </a>
                        </div>
                        <div className="navigation__content">
                            <p>
                                嘿嘿，本版本内容涵盖日常中遇到的客户问题处理记录，可以方便快速的查看一些重复问题的处理过程，快速为客户解决问题；提交文档请按照格式要求提交；
                            </p>
                        </div>
                    </div>
                    <div className="navigation__item">
                        <div className="navigation__title">
                            <a href="https://ebook.rancher.cn/solution/">
                                <h1>解决方案</h1>
                            </a>
                        </div>
                        <div className="navigation__content">
                            <p>
                                嘿嘿，本版块是一些解决方案，比如说Prometheus如何规划资源使用，如何监控应用，如果将Prometheus暴露出集群外等等等；提交文档请按照格式要求提交；
                            </p>
                        </div>
                    </div>
                    <div className="navigation__item">
                        <div className="navigation__title">
                            <a href="https://ebook.rancher.cn/tooluse">
                                <h1>排查工具的使用</h1>
                            </a>
                        </div>
                        <div className="navigation__content">
                            <p>
                               嘿嘿，本版块包括一些故障处理过程中的一些工具的使用，比如说 go pprof工具的使用等等；提交文档请按照格式要求提交；
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

export default Home;
