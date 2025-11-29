import React from 'react'
import {withRouter} from 'react-router'
import {Dropdown, SystemDialog} from '@stellar-expert/ui-framework'
import Footer from './footer-view'
import CatcherView from './catcher-view'
import {Breadcrumbs} from '../components/breadcrumbs'
import {SkipToMainContent} from '../components/accessibility'
import {resolvePath} from '../../business-logic/path'

/**
 * Layout component for pages that require authorization.
 * Redirects non-authorized users to login page preserving return path in ?ret
 * @param {ReactNode} children - Page contents
 * @param {Object} menu - Top menu
 */
export default withRouter(function Layout({children, menu}) {
    return <div className="page-wrapper">
        <SkipToMainContent />
        <div className="blue-ribbon"/>
        {menu}
        <div className="page-container">
            <div className="container">
                <Breadcrumbs />
            </div>
            <div id="main-content">
                <CatcherView>{children}</CatcherView>
            </div>
        </div>
        <Footer/>
        <SystemDialog/>
    </div>
})
