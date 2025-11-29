import React, {useMemo, useState, useCallback} from 'react'
import {Canvas} from '@react-three/fiber'
import ForceGraph2D from 'react-force-graph-2d'
import {AccountAddress} from '@stellar-expert/ui-framework'
import {AccountRelationshipGraph3D} from './account-relationship-graph-3d'
import './account-relationship-graph.scss'

/**
 * Account relationship graph visualization
 * Shows connections between accounts through transactions
 */
export function AccountRelationshipGraph({accountAddress, transactions, connections}) {
    const graphData = useMemo(() => {
        if (!transactions || !Array.isArray(transactions)) return null

        // Build relationship map
        const relationships = new Map()
        
        transactions.forEach(tx => {
            const source = tx.source_account || tx.source
            const operations = tx.operations || []
            
            operations.forEach(op => {
                const destination = op.destination || op.to || op.account
                if (destination && destination !== source) {
                    const key = `${source}-${destination}`
                    const count = relationships.get(key) || 0
                    relationships.set(key, count + 1)
                }
            })
        })

        // Convert to chart data
        const nodes = new Set()
        const links = []

        relationships.forEach((count, key) => {
            const [source, dest] = key.split('-')
            nodes.add(source)
            nodes.add(dest)
            links.push({
                source,
                target: dest,
                value: count
            })
        })

        return {
            nodes: Array.from(nodes).map(node => ({
                id: node,
                name: node.substring(0, 8) + '...'
            })),
            links
        }
    }, [transactions])

    if (!graphData || graphData.nodes.length === 0) {
        return (
            <div className="account-relationship-graph">
                <div className="no-relationships">
                    No relationship data available. This account may not have any transactions with other accounts.
                </div>
            </div>
        )
    }

    const [selectedNode, setSelectedNode] = useState(null)
    const [highlightedNode, setHighlightedNode] = useState(null)
    const [viewMode, setViewMode] = useState('2d') // '2d' or '3d'

    const handleNodeClick = useCallback((node) => {
        setSelectedNode(node)
    }, [])

    const handleNodeHover = useCallback((node) => {
        setHighlightedNode(node)
    }, [])

    const maxTransactions = Math.max(...graphData.links.map(l => l.value), 1)

    return (
        <div className="account-relationship-graph">
            <div className="graph-header">
                <h3>Account Relationships</h3>
                <div className="view-mode-toggle">
                    <button
                        className={viewMode === '2d' ? 'active' : ''}
                        onClick={() => setViewMode('2d')}
                    >
                        2D View
                    </button>
                    <button
                        className={viewMode === '3d' ? 'active' : ''}
                        onClick={() => setViewMode('3d')}
                    >
                        3D View
                    </button>
                </div>
            </div>
            <div className="graph-stats">
                <div className="stat-item">
                    <span className="stat-label">Connected Accounts:</span>
                    <span className="stat-value">{graphData.nodes.length - 1}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Total Connections:</span>
                    <span className="stat-value">{graphData.links.length}</span>
                </div>
            </div>
            {viewMode === '2d' ? (
                <div className="graph-visualization">
                    <ForceGraph2D
                        graphData={graphData}
                        nodeLabel={node => `${node.id.substring(0, 12)}...`}
                        nodeColor={node => {
                            if (node.id === accountAddress) return '#00f0ff'
                            if (highlightedNode && (node.id === highlightedNode.id || 
                                graphData.links.some(l => 
                                    (l.source === node.id && l.target === highlightedNode.id) ||
                                    (l.target === node.id && l.source === highlightedNode.id)
                                ))) return '#ff0080'
                            return '#6B46C1'
                        }}
                        linkColor={() => 'rgba(0, 240, 255, 0.3)'}
                        linkWidth={link => (link.value / maxTransactions) * 5}
                        linkDirectionalArrowLength={3}
                        linkDirectionalArrowRelPos={1}
                        onNodeClick={handleNodeClick}
                        onNodeHover={handleNodeHover}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const label = node.id.substring(0, 8) + '...'
                            const fontSize = 12 / globalScale
                            ctx.font = `${fontSize}px Sans-Serif`
                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'
                            ctx.fillStyle = node.id === accountAddress ? '#00f0ff' : '#fff'
                            ctx.fillText(label, node.x, node.y + 8)
                        }}
                        cooldownTicks={100}
                        onEngineStop={() => {
                            // Graph has stabilized
                        }}
                    />
                </div>
            ) : (
                <div className="graph-visualization-3d">
                    <Canvas
                        camera={{position: [0, 0, 100], fov: 60}}
                        gl={{antialias: true}}
                    >
                        <AccountRelationshipGraph3D
                            graphData={graphData}
                            accountAddress={accountAddress}
                            onNodeSelect={setSelectedNode}
                        />
                    </Canvas>
                </div>
            )}
            {selectedNode && (
                <div className="selected-node-info">
                    <h4>Selected Account</h4>
                    <AccountAddress account={selectedNode.id} chars="all" />
                    <button onClick={() => setSelectedNode(null)}>Close</button>
                </div>
            )}
            <div className="connections-list">
                <h4>Top Connections</h4>
                {graphData.links
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10)
                    .map((link, index) => (
                        <div key={index} className="connection-item">
                            <div className="connection-accounts">
                                <span className="account-node">{link.source.substring(0, 8)}...</span>
                                <span className="connection-arrow">→</span>
                                <span className="account-node">{link.target.substring(0, 8)}...</span>
                            </div>
                            <div className="connection-count">
                                {link.value} transaction{link.value !== 1 ? 's' : ''}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}

