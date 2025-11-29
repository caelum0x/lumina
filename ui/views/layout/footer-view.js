import React from 'react'
import {ThemeSelector} from '@stellar-expert/ui-framework'

export default function Footer() {
    return <div className="footer">
        <div className="container text-center">
            <div>{new Date().getFullYear()}&nbsp;©&nbsp;Lumina <span className="dimmed">v{appVersion}</span>
            </div>
            <div>
                <a href="/openapi.html" target="_blank" className="nowrap">
                    <i className="icon icon-embed"/> Open API docs
                </a>&emsp;
                <a href="https://github.com/orbitlens/stellar-expert-explorer/issues/" target="_blank" rel="noreferrer noopener" className="nowrap">
                    <i className="icon icon-github"/> Report a bug
                </a>&emsp;
                <ThemeSelector/>
            </div>
            <div>
                <a href="/info/tos">Terms of use</a>&emsp;
                <a href="/info/privacy">Privacy policy</a>
            </div>
            <div>
                <a href="https://twitter.com/orbitlens" target="_blank" rel="noreferrer noopener" className="nowrap">
                    <i className="icon icon-twitter"/>
                </a>&emsp;
                <a href="mailto:info@stellar.expert" target="_blank" rel="noreferrer noopener" className="nowrap">
                    <i className="icon icon-email"/>
                </a>
            </div>
        </div>
    </div>
}