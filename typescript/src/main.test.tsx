import * as React from 'react';
import * as renderer from 'react-test-renderer';

import Main from '../src/main';

it('renders correctly with defaults', () => {
  const button = renderer
      .create(<Main />)
      .toJSON();
  expect(button).toMatchSnapshot();
});
