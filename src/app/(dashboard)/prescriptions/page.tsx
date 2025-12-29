'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Spinner,
    Center,
    SimpleGrid,
    useColorModeValue,
    useToast,
    Badge,
    Button,
} from '@chakra-ui/react';
import { FiFileText, FiDownload } from 'react-icons/fi';
import PrescriptionCard from '@/components/PrescriptionCard';

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const headingColor = useColorModeValue('teal.700', 'teal.200');

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const token = localStorage.getItem('patientToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
            const response = await fetch(
                `${API_URL}/prescriptions/patient/my-prescriptions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            if (data.success) {
                setPrescriptions(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            toast({
                title: 'Error',
                description: 'Failed to load prescriptions',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Heading fontSize="2xl" color={headingColor}>
                            My Prescriptions
                        </Heading>
                        <Text color="gray.600" mt={1}>
                            View and download your medical prescriptions
                        </Text>
                    </Box>
                    <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
                        {prescriptions.length} {prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'}
                    </Badge>
                </HStack>

                {/* Prescriptions Grid */}
                {prescriptions.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {prescriptions.map((prescription) => (
                            <PrescriptionCard key={prescription._id} prescription={prescription} />
                        ))}
                    </SimpleGrid>
                ) : (
                    <Box
                        textAlign="center"
                        py={16}
                        bg={useColorModeValue('white', 'gray.800')}
                        borderRadius="xl"
                        boxShadow="lg"
                    >
                        <FiFileText size={64} color="gray" style={{ margin: '0 auto 24px' }} />
                        <Heading size="md" color="gray.600" mb={2}>
                            No Prescriptions Yet
                        </Heading>
                        <Text color="gray.500" mb={6}>
                            Your prescriptions will appear here once issued by your doctor
                        </Text>
                        <Button
                            colorScheme="teal"
                            onClick={() => window.location.href = '/book-appointment'}
                        >
                            Book an Appointment
                        </Button>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}
