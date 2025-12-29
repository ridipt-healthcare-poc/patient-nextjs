'use client';

import { Box, Heading, Text, VStack, Container, Card, CardBody, Icon } from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';

export default function SettingsPage() {
    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>Settings</Heading>
                    <Text color="gray.600">Manage your account preferences and security</Text>
                </Box>

                <Card>
                    <CardBody py={10} textAlign="center">
                        <Icon as={FiSettings} boxSize={12} color="blue.500" mb={4} />
                        <Heading size="md" mb={2}>Settings Page Coming Soon</Heading>
                        <Text color="gray.500">
                            We're working on bringing you more control over your account.
                            Check back soon for update notifications, security settings, and more!
                        </Text>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
}
