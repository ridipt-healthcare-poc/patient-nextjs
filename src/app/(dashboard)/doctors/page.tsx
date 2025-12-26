'use client';

import React from "react";
import {
    Box,
    Heading,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

export default function DoctorsPage() {
    return (
        <Box>
            <Heading fontSize="2xl" mb={2} color={useColorModeValue("teal.700", "teal.200")}>
                My Doctors
            </Heading>
            <Text color="gray.500" mb={6}>
                View and manage your healthcare providers
            </Text>
            <Box
                p={8}
                bg={useColorModeValue("teal.50", "gray.700")}
                borderRadius="xl"
                textAlign="center"
            >
                <Text fontSize="lg" color="gray.600">
                    Doctors page coming soon...
                </Text>
            </Box>
        </Box>
    );
}
