/**
 * Test setup file for Jest
 * This file configures the testing environment
 */

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock EventSource for SSE tests
global.EventSource = jest.fn().mockImplementation(() => ({
    readyState: 0, // CONNECTING
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    onopen: null,
    onmessage: null,
    onerror: null
}))

// Mock WebGL for 3D tests
const mockWebGLContext = {
    canvas: document.createElement('canvas'),
    getParameter: jest.fn(),
    getExtension: jest.fn(),
    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    getShaderParameter: jest.fn(),
    createProgram: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    useProgram: jest.fn(),
    getProgramParameter: jest.fn(),
    getUniformLocation: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    createBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    drawArrays: jest.fn(),
    clear: jest.fn(),
    clearColor: jest.fn(),
    viewport: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    blendFunc: jest.fn(),
    depthFunc: jest.fn(),
    cullFace: jest.fn(),
    frontFace: jest.fn(),
    pixelStorei: jest.fn(),
    activeTexture: jest.fn(),
    bindTexture: jest.fn(),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
    generateMipmap: jest.fn(),
    createTexture: jest.fn(),
    deleteTexture: jest.fn(),
    deleteShader: jest.fn(),
    deleteProgram: jest.fn(),
    deleteBuffer: jest.fn(),
    getAttribLocation: jest.fn(),
    uniform1f: jest.fn(),
    uniform2f: jest.fn(),
    uniform3f: jest.fn(),
    uniform4f: jest.fn(),
    uniform1i: jest.fn(),
    uniform2i: jest.fn(),
    uniform3i: jest.fn(),
    uniform4i: jest.fn(),
    uniform1fv: jest.fn(),
    uniform2fv: jest.fn(),
    uniform3fv: jest.fn(),
    uniform4fv: jest.fn(),
    uniformMatrix2fv: jest.fn(),
    uniformMatrix3fv: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    bindAttribLocation: jest.fn(),
    getShaderInfoLog: jest.fn(),
    getProgramInfoLog: jest.fn(),
    isContextLost: jest.fn(() => false)
}

HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
        return mockWebGLContext
    }
    return null
})

// Mock Three.js for 3D component tests
jest.mock('three', () => {
    const mockThree = jest.requireActual('three')
    return {
        ...mockThree,
        WebGLRenderer: jest.fn().mockImplementation(() => ({
            setSize: jest.fn(),
            render: jest.fn(),
            setPixelRatio: jest.fn(),
            domElement: document.createElement('canvas')
        })),
        Scene: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            remove: jest.fn()
        })),
        PerspectiveCamera: jest.fn().mockImplementation(() => ({
            position: {set: jest.fn()},
            lookAt: jest.fn(),
            updateProjectionMatrix: jest.fn()
        }))
    }
})

// Setup Enzyme if using it
// import { configure } from 'enzyme'
// import Adapter from 'enzyme-adapter-react-16'
// configure({ adapter: new Adapter() })

