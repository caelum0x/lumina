import React, {useState, useEffect} from 'react'
import {Button, useExplorerApi} from '@stellar-expert/ui-framework'
import './address-label-manager.scss'

export default function AddressLabelManager({address, currentLabel, onUpdate}) {
    const [isEditing, setIsEditing] = useState(false)
    const [label, setLabel] = useState(currentLabel || '')
    const [color, setColor] = useState('#8B5CF6')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)

    const colors = [
        '#8B5CF6', // Purple
        '#EF4444', // Red
        '#10B981', // Green
        '#3B82F6', // Blue
        '#F59E0B', // Orange
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#14B8A6'  // Teal
    ]

    const handleSave = async () => {
        if (!label.trim()) return
        
        setSaving(true)
        try {
            const response = await fetch(`/explorer/public/labels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': localStorage.getItem('userId') || generateUserId()
                },
                body: JSON.stringify({address, label, color, notes})
            })
            
            if (response.ok) {
                setIsEditing(false)
                if (onUpdate) onUpdate({address, label, color, notes})
            }
        } catch (e) {
            console.error('Failed to save label:', e)
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/explorer/public/labels/${address}`, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': localStorage.getItem('userId') || generateUserId()
                }
            })
            
            if (response.ok) {
                setLabel('')
                setIsEditing(false)
                if (onUpdate) onUpdate(null)
            }
        } catch (e) {
            console.error('Failed to delete label:', e)
        }
        setSaving(false)
    }

    function generateUserId() {
        const id = 'user_' + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('userId', id)
        return id
    }

    if (!isEditing && !currentLabel) {
        return (
            <button 
                className="label-add-btn" 
                onClick={() => setIsEditing(true)}
                title="Add label to this address"
            >
                🏷️ Add Label
            </button>
        )
    }

    if (!isEditing && currentLabel) {
        return (
            <div className="address-label" style={{borderColor: color}}>
                <span className="label-text" style={{color}}>{currentLabel}</span>
                <button className="label-edit-btn" onClick={() => setIsEditing(true)}>✏️</button>
            </div>
        )
    }

    return (
        <div className="label-editor">
            <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Enter label name..."
                maxLength={100}
                autoFocus
            />
            
            <div className="color-picker">
                {colors.map(c => (
                    <button
                        key={c}
                        className={`color-btn ${color === c ? 'active' : ''}`}
                        style={{backgroundColor: c}}
                        onClick={() => setColor(c)}
                    />
                ))}
            </div>
            
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes (optional)..."
                maxLength={500}
                rows={2}
            />
            
            <div className="label-actions">
                <Button onClick={handleSave} disabled={saving || !label.trim()}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
                {currentLabel && (
                    <Button onClick={handleDelete} disabled={saving}>
                        Delete
                    </Button>
                )}
                <Button onClick={() => setIsEditing(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    )
}

export function AddressWithLabel({address, showLabel = true}) {
    const {data} = useExplorerApi(`labels/${address}`)
    
    if (!showLabel || !data?.label) {
        return <span className="account-address">{address}</span>
    }
    
    return (
        <span className="account-address-with-label">
            <span className="account-address">{address}</span>
            <span className="address-label-inline" style={{color: data.color}}>
                {data.label}
            </span>
        </span>
    )
}
