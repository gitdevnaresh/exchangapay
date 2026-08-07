// SVGs are compiled to components by react-native-svg-transformer in Metro.
// Under Jest they resolve to a host component with the same props surface.
const React = require('react');
const SvgMock = (props) => React.createElement('SvgMock', props, props.children);
module.exports = SvgMock;
module.exports.default = SvgMock;
module.exports.ReactComponent = SvgMock;
