import Head from "next/head";
import { Box, Container } from "@chakra-ui/react";

const Main = ({ children, router }) => {
  return (
    <Box as="main" pb={8}>
      <Head>
        <meta name="viewport" content="width:device-wdoth, initial-scale=1" />
        <title>Neil Suthar - Homepage</title>
      </Head>

      <Container maxW="container.md" pt={11}>
        {children}
      </Container>
    </Box>
  );
};
export default Main;
