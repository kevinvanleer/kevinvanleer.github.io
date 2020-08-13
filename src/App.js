import React from 'react';
import moment from 'moment';
import { faFile, faMap, faImages } from '@fortawesome/free-solid-svg-icons';
import {
  faLinkedin,
  faFacebook,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
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
    >
      <Flexbox
        flexDirection="column"
        maxWidth="80ch"
        height="100%"
        overflow="auto"
        padding="1em"
      >
        <Text fontSize="title">kevinvanleer.com</Text>
        <Spacer height="1em" />
        <Text>
          Hi, I’m Kevin Van Leer, husband, father of three, and
          do-it-yourselfer. I love working with my hands and creating beautiful
          and useful things and experiences. Whether I’m at the keyboard,
          playing my saxophone, or down in the woodshop, I get great
          satisfaction out of seeing my ideas come to fruition.
        </Text>
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
        <Flexbox
          justifyContent="space-around"
          flexWrap="wrap"
          marginBetween="1em"
          wrapMargin="1em"
        >
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
          <Link href="https://photos.app.goo.gl/ZEwJhPfaTAxpCdED8">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="10x" icon={faImages} />
              <Spacer height="1em" />
              <Text fontSize="label">Woodworking</Text>
            </Flexbox>
          </Link>
        </Flexbox>
        <Spacer flexGrow={1} t height="3em" />
        <Flexbox width="20ch" justifyContent="space-between">
          <Link href="https://www.linkedin.com/in/kevin-vanleer/">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faLinkedin} />
              <Spacer height="1em" />
              <Text fontSize="detail">LinkedIn</Text>
            </Flexbox>
          </Link>
          <Link href="https://www.facebook.com/kevin.vanleer">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faFacebook} />
              <Spacer height="1em" />
              <Text fontSize="detail">Facebook</Text>
            </Flexbox>
          </Link>
          <Link href="https://www.twitter.com/trukvl">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faTwitter} />
              <Spacer height="1em" />
              <Text fontSize="detail">Twitter</Text>
            </Flexbox>
          </Link>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default App;
