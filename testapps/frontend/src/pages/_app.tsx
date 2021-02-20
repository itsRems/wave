import { AppProps } from 'next/app';

const WaveFrontend = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
}

export default WaveFrontend;