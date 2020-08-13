import React from 'react';
import moment from 'moment';
import { faFile, faMap } from '@fortawesome/free-solid-svg-icons';
import { Flexbox, Text, Link, Icon, Spacer } from 'kvl-ui';

function App() {
  return (
    <Flexbox
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      backgroundColor="#282c34"
      color="#eee"
      flexDirection="column"
      padding="1em"
    >
      <Flexbox flexDirection="column" maxWidth="80ch">
        <Text fontSize="title">Kevin Van Leer</Text>
        <Spacer height="1em" />
        <Text>
          I’ve been writing software for {moment('2004-06-12').fromNow(true)}{' '}
          and leading software teams for{' '}
          {moment('2008').fromNow(true).split(' ')[0]}. I’m passionate about
          beautiful, easy-to-use software, as much as I am about
          well-structured, easy-to-read code. I’m an advocate for Agile software
          development principles, automated testing, and continuous integration
          and deployment. I enjoy leading teams, coaching, mentoring, and
          inspiring colleagues to be their best. I believe collaboration and
          transparency are key traits of a highly functioning team, and that
          straightforward honest communication is the best way to gain the
          respect and trust of those around you.
        </Text>
        <Spacer height="2em" />
        <Text fontSize="heading">Links</Text>
        <Spacer height="1em" />
        <Flexbox justifyContent="space-around">
          <Link href="/resume">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="10x" icon={faFile} />
              <Spacer height="1em" />
              <Text fontSize="label">Resume</Text>
            </Flexbox>
          </Link>
          <Link href="http://covid19.kevinvanleer.com">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="10x" icon={faMap} />
              <Spacer height="1em" />
              <Text fontSize="label">COVID-19</Text>
              <Text fontSize="label">Visualization</Text>
            </Flexbox>
          </Link>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default App;
