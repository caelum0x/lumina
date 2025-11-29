import React, {useState} from 'react'
import {Dropdown} from '@stellar-expert/ui-framework'
import {resolvePath} from '../../business-logic/path'
import {SmartSearch} from '../components/smart-search'
import LoginStatus from '../components/login-status'
import {ThemeToggle} from '../components/theme-toggle'
import NetworkSwitchView from './network-switch-view'

const services = [
    {title: 'Accounts Directory', href: resolvePath('', 'directory')},
    {title: 'Domains BlockList', href: resolvePath('', 'directory/blocked-domains')},
    {title: 'Payment Locator', href: resolvePath('payment-locator')},
    {title: 'Operations Live Stream', href: resolvePath('operations-live-stream')},
    {title: 'Account Demolisher', href: resolvePath('', 'demolisher')},
    {title: 'Tax Data Export', href: "https://ledgers.tax/"},
    {title: 'Protocol Versions History', href: resolvePath('protocol-history')},
    {title: 'Asset Lists Catalogue', href: '/asset-lists'}
    //{title: 'Account Demolisher', href: resolvePath('', 'demolisher')}
]

export default function TopMenuView() {
    const [menuVisible, setMenuVisible] = useState(false)

    return <div className="top-block">
        <div className="container nav relative">
            <a href={resolvePath('')} className="logo">
                <span style={{fontSize: '1.4em', fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Lumina</span>
            </a>
            <a className="toggle-menu" href="#" onClick={e => setMenuVisible(!menuVisible)}>
                <i className="icon icon-menu" style={{fontSize: '1.4em', marginRight: '0.3em'}}/>
            </a>
            <div className={`nav-menu-dropdown ${menuVisible && 'active'}`}>
                <div className="main-menu top-menu-block" onClick={e => setMenuVisible(false)}>
                    <a href={resolvePath('asset')}>Assets</a>
                    <a href={resolvePath('liquidity-pool')}>Pools</a>
                    <a href={resolvePath('network-activity')}>Network</a>
                    <a href={`/graph/3d/${resolvePath('').split('/').pop() || 'public'}`}>3D</a>
                </div>
                <div className="top-menu-block right" style={{float: 'right'}}>
                    <SmartSearch className="shrinkable" />
                </div>
                <div className="top-menu-block right" style={{float: 'right'}}>
                    <ThemeToggle />
                </div>
                <div className="top-menu-block right" style={{float: 'right'}}><NetworkSwitchView/></div>
            </div>
        </div>
    </div>
}