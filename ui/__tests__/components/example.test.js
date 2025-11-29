/**
 * Example test file
 * This demonstrates the testing setup
 */

describe('Example Test Suite', () => {
    test('basic test example', () => {
        expect(1 + 1).toBe(2)
    })

    test('string manipulation', () => {
        const str = 'Hello World'
        expect(str.toLowerCase()).toBe('hello world')
    })

    test('array operations', () => {
        const arr = [1, 2, 3]
        expect(arr.length).toBe(3)
        expect(arr.includes(2)).toBe(true)
    })
})

// Example React component test (requires React Testing Library)
// import React from 'react'
// import { render, screen } from '@testing-library/react'
// import ExampleComponent from '../../views/components/example-component'
//
// describe('ExampleComponent', () => {
//     test('renders correctly', () => {
//         render(<ExampleComponent />)
//         expect(screen.getByText('Example')).toBeInTheDocument()
//     })
// })

