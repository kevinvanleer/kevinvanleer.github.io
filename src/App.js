import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import './index.css';
import {
  faFile,
  faMapMarkedAlt,
  faImages,
} from '@fortawesome/free-solid-svg-icons';
import {
  faGithub,
  faLinkedin,
  faFacebook,
  faTwitter,
  faSoundcloud,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { Flexbox, Text, Link, Icon, Spacer } from 'kvl-ui';

const Title = styled(Text)`
  font-size: 32px;
  @media screen and (min-width: 320px) {
    & {
      font-size: calc(32px + (96 - 32) * ((100vw - 320px) / (800 - 320)));
    }
  }
  @media screen and (min-width: 800px) {
    & {
      font-size: 96px;
    }
  }
`;

function App() {
  return (
    <Flexbox
      flexDirection="column"
      backgroundColor="#282c34"
      color="#eee"
      height="100%"
      alignItems="center"
    >
      <Flexbox
        flexDirection="column"
        backgroundColor="#282c34"
        maxWidth="80ch"
        padding="1em 1em 0 1em"
        height="100%"
      >
        <Flexbox flexDirection="column">
          <img
            alt="Kevin and his wife Jillian in Acadia National Park"
            src="/kev-n-jill.jpg"
            style={{ width: '100%' }}
          />
          <Title color="#ef8f00">kevinvanleer.com</Title>
        </Flexbox>
        <Spacer height="2em" />
        <Text>
          Hi, I’m Kevin Van Leer, husband, father of three, and
          do-it-yourselfer. I love working with my hands to create beautiful and
          useful things. I’m just as passionate about creating enjoyable
          experiences. Whether I’m coding, playing my saxophone, or down in the
          woodshop, I get great satisfaction out of seeing my ideas come to
          fruition.
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
              <Icon size="10x" icon={faMapMarkedAlt} />
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
        <Spacer flexGrow={1} height="3em" />
        <Flexbox marginBetween="1em">
          <Link href="https://github.com/kevinvanleer/">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faGithub} />
              <Spacer height="1em" />
              <Text fontSize="detail">GitHub</Text>
            </Flexbox>
          </Link>
          <Link href="https://www.linkedin.com/in/kevin-vanleer/">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faLinkedin} />
              <Spacer height="1em" />
              <Text fontSize="detail">LinkedIn</Text>
            </Flexbox>
          </Link>
          <Link href="https://soundcloud.com/kevin-van-leer-381908490">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faSoundcloud} />
              <Spacer height="1em" />
              <Text fontSize="detail">SoundCloud</Text>
            </Flexbox>
          </Link>
          <Link href="https://www.youtube.com/c/KevinVanLeerJet">
            <Flexbox flexDirection="column" alignItems="center">
              <Icon size="2x" icon={faYoutube} />
              <Spacer height="1em" />
              <Text fontSize="detail">YouTube</Text>
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
        <Spacer height="1em" />
      </Flexbox>
    </Flexbox>
  );
}

export default App;
