/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import * as React from 'react'
import Main from '../src/Main'

// Note: test renderer must be required after react-native.
import * as renderer from 'react-test-renderer'

it('renders correctly', () => {
  renderer.create(<Main />);
});
