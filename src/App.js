import React, { useEffect } from 'react';
import styled from 'styled-components';
import ReactGA from 'react-ga';
import moment from 'moment';
import {
  faGithub,
  faLinkedin,
  faReddit,
  faFacebook,
  faTwitter,
  faSoundcloud,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { Flexbox, Text, Link, Icon, Spacer } from 'kvl-react-ui';
import cyclotrackLogo from './cyclotrack-app.svg';

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

const App = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

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
            src="/kev-n-jill-960.webp"
            style={{ width: '100%' }}
          />
          <Title color="#ef8f00" marginLeft="-0.75%">
            kevinvanleer.com
          </Title>
        </Flexbox>
        <Spacer height="4em" />
        <main tabIndex="0">
          <Text fontSize="label">
            Hi, I’m Kevin Van Leer, husband, father of three, and
            do-it-yourselfer. I love working with my hands to create beautiful
            and useful things. I’m just as passionate about creating enjoyable
            experiences. Whether I’m coding, playing my saxophone, or down in
            the woodshop, I get great satisfaction out of seeing my ideas come
            to fruition.
          </Text>
          <Spacer height="1em" />
          <Text fontSize="label">
            I’ve been writing software for {moment('2004-06-12').fromNow(true)}{' '}
            and leading software teams for{' '}
            {moment('2008').fromNow(true).split(' ')[0]}. I’m passionate about
            beautiful, easy-to-use software, as much as I am about
            well-structured, easy-to-read code. I’m an advocate for Agile
            software development principles, automated testing, and continuous
            integration and deployment. I enjoy leading teams, coaching,
            mentoring, and inspiring colleagues to be their best. I believe
            collaboration and transparency are key traits of a highly
            functioning team, and that straightforward honest communication is
            the best way to gain the respect and trust of those around you.
          </Text>
        </main>
        <Spacer height="10em" />
        <Text centerAlign fontSize="2em" color="#38c9e4">
          Some of my projects
        </Text>
        <Spacer height="4em" />
        <nav>
          <Flexbox
            justifyContent="space-around"
            flexWrap="wrap"
            marginBetween="1em"
            wrapMargin="1em"
          >
            <Link color="#84878e" href="http://kevinvanleer.com/cyclotrack/#/">
              <Flexbox flexDirection="column" alignItems="center">
                <img
                  style={{ border: '3px solid #5f6167', borderRadius: '10px' }}
                  height="160px"
                  width="256px"
                  src={cyclotrackLogo}
                  alt="Cyclotrack logo"
                />
                <Spacer height="1em" />
                <Text fontSize="label">Cyclotrack</Text>
                <Text fontSize="detail">GPS/BLE cycle computer</Text>
              </Flexbox>
            </Link>
            <Link color="#84878e" href="http://covid19.kevinvanleer.com">
              <Flexbox flexDirection="column" alignItems="center">
                <img
                  style={{ border: '3px solid #5f6167', borderRadius: '10px' }}
                  height="160px"
                  src="/img/covid19-app-thumbnail.jpg"
                  alt="Sceenshot from Kevin's COVID-19 Map web app"
                />
                <Spacer height="1em" />
                <Text fontSize="label">COVID-19</Text>
                <Text fontSize="label">Visualization</Text>
              </Flexbox>
            </Link>
            <Link
              color="#84878e"
              href="https://photos.app.goo.gl/ZEwJhPfaTAxpCdED8"
            >
              <Flexbox flexDirection="column" alignItems="center">
                <img
                  style={{ border: '3px solid #5f6167', borderRadius: '10px' }}
                  height="160px"
                  src="/img/woodworking-thumbnail.jpg"
                  alt="One of Kevin's furniture projects"
                />
                <Spacer height="1em" />
                <Text fontSize="label">Woodworking</Text>
              </Flexbox>
            </Link>
            <Link color="#84878e" href="/resume">
              <Flexbox flexDirection="column" alignItems="center">
                <img
                  style={{ border: '3px solid #5f6167', borderRadius: '10px' }}
                  height="160px"
                  src="/img/resume-thumbnail.jpg"
                  alt="Resume thumbnail"
                />
                <Spacer height="1em" />
                <Text fontSize="label">Resume</Text>
              </Flexbox>
            </Link>
          </Flexbox>
        </nav>
        <Spacer flexGrow={1} height="10em" />
        <Text centerAlign fontSize="2em" color="#38c9e4">
          More about me
        </Text>
        <Spacer height="4em" />
        <nav>
          <Flexbox
            marginBetween="1em"
            flexWrap="wrap"
            maxHeight="55px"
            overflow="hidden"
            justifyContent="center"
          >
            <Link color="#84878e" href="https://github.com/kevinvanleer/">
              <Flexbox flexDirection="column" alignItems="center">
                <Icon color="#fff" size="2x" icon={faGithub} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">GitHub</Text>
              </Flexbox>
            </Link>
            <Link color="#84878e" href="https://www.reddit.com/user/iamkvl/">
              <Flexbox flexDirection="column" alignItems="center">
                <Icon size="2x" color="#ff4500" icon={faReddit} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">Reddit</Text>
              </Flexbox>
            </Link>
            <Link
              color="#84878e"
              href="https://www.linkedin.com/in/kevin-vanleer/"
            >
              <Flexbox flexDirection="column" alignItems="center">
                <Icon size="2x" color="#0077b5" icon={faLinkedin} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">LinkedIn</Text>
              </Flexbox>
            </Link>
            <Link
              color="#84878e"
              href="https://soundcloud.com/kevin-van-leer-381908490"
            >
              <Flexbox flexDirection="column" alignItems="center">
                <Icon color="#ff8800" size="2x" icon={faSoundcloud} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">SoundCloud</Text>
              </Flexbox>
            </Link>
            <Link
              color="#84878e"
              href="https://www.youtube.com/c/KevinVanLeerJet"
            >
              <Flexbox flexDirection="column" alignItems="center">
                <Icon size="2x" color="#f00" icon={faYoutube} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">YouTube</Text>
              </Flexbox>
            </Link>
            <Link color="#84878e" href="https://www.facebook.com/kevin.vanleer">
              <Flexbox flexDirection="column" alignItems="center">
                <Icon color="#3b5998" size="2x" icon={faFacebook} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">Facebook</Text>
              </Flexbox>
            </Link>
            <Link color="#84878e" href="https://www.twitter.com/trukvl">
              <Flexbox flexDirection="column" alignItems="center">
                <Icon color="#1da1f2" size="2x" icon={faTwitter} />
                <Spacer height="0.5em" />
                <Text fontSize="detail">Twitter</Text>
              </Flexbox>
            </Link>
          </Flexbox>
        </nav>
        <Spacer height="1em" />
      </Flexbox>
    </Flexbox>
  );
};

export default App;
