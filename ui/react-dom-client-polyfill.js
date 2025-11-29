// Polyfill for react-dom/client to support React 17
const ReactDOM = require('react-dom')

module.exports = {
  createRoot: (container) => ({
    render: (element) => ReactDOM.render(element, container),
    unmount: () => ReactDOM.unmountComponentAtNode(container)
  }),
  hydrateRoot: (container, element) => {
    ReactDOM.hydrate(element, container)
    return {
      render: (element) => ReactDOM.hydrate(element, container),
      unmount: () => ReactDOM.unmountComponentAtNode(container)
    }
  }
}
