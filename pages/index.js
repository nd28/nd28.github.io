import { Container, Box, Heading } from "@chakra-ui/react";

const Page = () => {
  return (
    <Container>
      <Box borderRadius="lg" p={3} mb={6} bg="red" align="center">
        Hello, I&apos;m a full-stack developer based in India!
      </Box>

      <Box display={{ md: "flex" }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Nilesh Suthar
          </Heading>
          <p>( Developer / Designer )</p>
        </Box>
      </Box>
    </Container>
  );
};

export default Page;
