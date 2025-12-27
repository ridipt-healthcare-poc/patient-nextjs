'use client';

import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    useToast,
    Spinner,
    Center,
    Divider,
    Badge,
    Icon,
    Avatar,
    useColorModeValue,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import {
    FiEdit2,
    FiSave,
    FiX,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiHeart,
    FiAlertCircle,
    FiUsers,
    FiCalendar,
} from "react-icons/fi";
import { FaHospital } from "react-icons/fa";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [newAllergy, setNewAllergy] = useState("");
    const [newCondition, setNewCondition] = useState("");
    const [newMedication, setNewMedication] = useState("");

    const toast = useToast();
    const cardBg = useColorModeValue("white", "gray.800");
    const cardShadow = useColorModeValue(
        "0 18px 35px rgba(15, 23, 42, 0.08)",
        "0 18px 35px rgba(0, 0, 0, 0.5)"
    );

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const api = await import('../../../lib/api');
            const response = await api.patientApi.getProfile();

            if (response.data.success) {
                setProfile(response.data.data);
                setFormData(response.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to load profile",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const api = await import('../../../lib/api');
            const response = await api.patientApi.updateProfile(formData);

            if (response.data.success) {
                setProfile(response.data.data);
                setFormData(response.data.data);
                setIsEditing(false);
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update profile",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddressChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [field]: value,
            },
        }));
    };

    const addTag = (field: string, value: string, setter: Function) => {
        if (value.trim()) {
            const currentArray = formData[field] || [];
            if (!currentArray.includes(value.trim())) {
                handleInputChange(field, [...currentArray, value.trim()]);
            }
            setter("");
        }
    };

    const removeTag = (field: string, index: number) => {
        const currentArray = formData[field] || [];
        handleInputChange(field, currentArray.filter((_: any, i: number) => i !== index));
    };

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    if (!profile) {
        return (
            <Center h="400px">
                <Text color="red.500">Failed to load profile</Text>
            </Center>
        );
    }

    return (
        <Container maxW="1200px" py={8}>
            {/* Header Section */}
            <Box
                position="relative"
                overflow="hidden"
                borderRadius="3xl"
                px={{ base: 6, md: 10 }}
                py={{ base: 8, md: 10 }}
                bgGradient="linear(to-r, teal.600, cyan.500)"
                color="white"
                mb={8}
            >
                <Box
                    position="absolute"
                    top="-10"
                    right="-10"
                    w="260px"
                    h="260px"
                    borderRadius="full"
                    bg="whiteAlpha.200"
                />
                <HStack spacing={6} align="center" position="relative">
                    <Avatar
                        size="2xl"
                        name={profile.fullName}
                        bg="teal.300"
                        color="white"
                    />
                    <VStack align="flex-start" spacing={2}>
                        <Heading fontSize={{ base: "2xl", md: "3xl" }}>
                            {profile.fullName}
                        </Heading>
                        <HStack spacing={4}>
                            <HStack>
                                <Icon as={FiMail} />
                                <Text fontSize="sm">{profile.email || "No email"}</Text>
                            </HStack>
                            <HStack>
                                <Icon as={FiPhone} />
                                <Text fontSize="sm">{profile.mobile}</Text>
                            </HStack>
                        </HStack>
                        <HStack spacing={2}>
                            {profile.gender && (
                                <Badge colorScheme="teal" variant="solid">
                                    {profile.gender}
                                </Badge>
                            )}
                            {profile.bloodGroup && (
                                <Badge colorScheme="red" variant="solid">
                                    {profile.bloodGroup}
                                </Badge>
                            )}
                            {profile.age && (
                                <Badge colorScheme="blue" variant="solid">
                                    Age: {profile.age}
                                </Badge>
                            )}
                        </HStack>
                    </VStack>
                    <Box flex="1" />
                    {!isEditing ? (
                        <Button
                            leftIcon={<FiEdit2 />}
                            colorScheme="whiteAlpha"
                            bg="white"
                            color="teal.600"
                            _hover={{ bg: "teal.50" }}
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <HStack>
                            <Button
                                leftIcon={<FiSave />}
                                colorScheme="whiteAlpha"
                                bg="white"
                                color="teal.600"
                                _hover={{ bg: "teal.50" }}
                                onClick={handleSave}
                                isLoading={saving}
                            >
                                Save
                            </Button>
                            <Button
                                leftIcon={<FiX />}
                                variant="outline"
                                color="white"
                                borderColor="whiteAlpha.600"
                                _hover={{ bg: "whiteAlpha.200" }}
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </HStack>
                    )}
                </HStack>
            </Box>

            {/* Personal Information */}
            <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow={cardShadow} mb={6}>
                <HStack mb={6}>
                    <Icon as={FiUser} boxSize={6} color="teal.500" />
                    <Heading size="md" color="teal.700">
                        Personal Information
                    </Heading>
                </HStack>
                <Divider mb={6} />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.fullName || ""}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.fullName}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        {isEditing ? (
                            <Input
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.email || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Mobile Number</FormLabel>
                        <Text fontWeight="500" color="gray.500">
                            {profile.mobile} (Cannot be changed)
                        </Text>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Date of Birth</FormLabel>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={formData.dateOfBirth || ""}
                                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">
                                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"}
                            </Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Age</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.age || ""}
                                onChange={(e) => handleInputChange("age", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.age || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Gender</FormLabel>
                        {isEditing ? (
                            <Select
                                value={formData.gender || ""}
                                onChange={(e) => handleInputChange("gender", e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Select>
                        ) : (
                            <Text fontWeight="500">{profile.gender || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Blood Group</FormLabel>
                        {isEditing ? (
                            <Select
                                value={formData.bloodGroup || ""}
                                onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </Select>
                        ) : (
                            <Text fontWeight="500">{profile.bloodGroup || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Preferred Contact Method</FormLabel>
                        {isEditing ? (
                            <Select
                                value={formData.preferredContactMethod || "Phone"}
                                onChange={(e) => handleInputChange("preferredContactMethod", e.target.value)}
                            >
                                <option value="Phone">Phone</option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="SMS">SMS</option>
                            </Select>
                        ) : (
                            <Text fontWeight="500">{profile.preferredContactMethod || "Phone"}</Text>
                        )}
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* Address Section */}
            <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow={cardShadow} mb={6}>
                <HStack mb={6}>
                    <Icon as={FiMapPin} boxSize={6} color="teal.500" />
                    <Heading size="md" color="teal.700">
                        Address
                    </Heading>
                </HStack>
                <Divider mb={6} />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                        <FormLabel>Street</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.address?.street || ""}
                                onChange={(e) => handleAddressChange("street", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.address?.street || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>City</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.address?.city || ""}
                                onChange={(e) => handleAddressChange("city", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.address?.city || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>State</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.address?.state || ""}
                                onChange={(e) => handleAddressChange("state", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.address?.state || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Country</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.address?.country || "India"}
                                onChange={(e) => handleAddressChange("country", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.address?.country || "India"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Pincode</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.address?.pincode || ""}
                                onChange={(e) => handleAddressChange("pincode", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.address?.pincode || "Not provided"}</Text>
                        )}
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* Medical Information */}
            <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow={cardShadow} mb={6}>
                <HStack mb={6}>
                    <Icon as={FiHeart} boxSize={6} color="teal.500" />
                    <Heading size="md" color="teal.700">
                        Medical Information
                    </Heading>
                </HStack>
                <Divider mb={6} />
                <VStack spacing={6} align="stretch">
                    <FormControl>
                        <FormLabel>Known Allergies</FormLabel>
                        {isEditing ? (
                            <VStack align="stretch" spacing={3}>
                                <HStack>
                                    <Input
                                        placeholder="Add allergy"
                                        value={newAllergy}
                                        onChange={(e) => setNewAllergy(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addTag('knownAllergies', newAllergy, setNewAllergy);
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={() => addTag('knownAllergies', newAllergy, setNewAllergy)}
                                        colorScheme="teal"
                                    >
                                        Add
                                    </Button>
                                </HStack>
                                <Wrap>
                                    {(formData.knownAllergies || []).map((allergy: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Tag size="lg" colorScheme="red" borderRadius="full">
                                                <TagLabel>{allergy}</TagLabel>
                                                <TagCloseButton onClick={() => removeTag('knownAllergies', index)} />
                                            </Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </VStack>
                        ) : (
                            <Wrap>
                                {(profile.knownAllergies || []).length > 0 ? (
                                    (profile.knownAllergies || []).map((allergy: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Tag size="lg" colorScheme="red" borderRadius="full">
                                                {allergy}
                                            </Tag>
                                        </WrapItem>
                                    ))
                                ) : (
                                    <Text color="gray.500">No allergies recorded</Text>
                                )}
                            </Wrap>
                        )}
                    </FormControl>

                    <FormControl>
                        <FormLabel>Medical Conditions</FormLabel>
                        {isEditing ? (
                            <VStack align="stretch" spacing={3}>
                                <HStack>
                                    <Input
                                        placeholder="Add condition"
                                        value={newCondition}
                                        onChange={(e) => setNewCondition(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addTag('medicalConditions', newCondition, setNewCondition);
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={() => addTag('medicalConditions', newCondition, setNewCondition)}
                                        colorScheme="teal"
                                    >
                                        Add
                                    </Button>
                                </HStack>
                                <Wrap>
                                    {(formData.medicalConditions || []).map((condition: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Tag size="lg" colorScheme="orange" borderRadius="full">
                                                <TagLabel>{condition}</TagLabel>
                                                <TagCloseButton onClick={() => removeTag('medicalConditions', index)} />
                                            </Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </VStack>
                        ) : (
                            <Wrap>
                                {(profile.medicalConditions || []).length > 0 ? (
                                    (profile.medicalConditions || []).map((condition: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Tag size="lg" colorScheme="orange" borderRadius="full">
                                                {condition}
                                            </Tag>
                                        </WrapItem>
                                    ))
                                ) : (
                                    <Text color="gray.500">No conditions recorded</Text>
                                )}
                            </Wrap>
                        )}
                    </FormControl>

                    <FormControl>
                        <FormLabel>Current Medications</FormLabel>
                        {isEditing ? (
                            <VStack align="stretch" spacing={3}>
                                <HStack>
                                    <Input
                                        placeholder="Add medication"
                                        value={newMedication}
                                        onChange={(e) => setNewMedication(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addTag('medications', newMedication, setNewMedication);
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={() => addTag('medications', newMedication, setNewMedication)}
                                        colorScheme="teal"
                                    >
                                        Add
                                    </Button>
                                </HStack>
                                <Wrap>
                                    {(formData.medications || []).map((medication: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Tag size="lg" colorScheme="blue" borderRadius="full">
                                                <TagLabel>{medication}</TagLabel>
                                                <TagCloseButton onClick={() => removeTag('medications', index)} />
                                            </Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </VStack>
                        ) : (
                            <Wrap>
                                {(profile.medications || []).length > 0 ? (
                                    (profile.medications || []).map((medication: string, index: number) => (
                                        <WrapItem key={index}>
                                            <Tag size="lg" colorScheme="blue" borderRadius="full">
                                                {medication}
                                            </Tag>
                                        </WrapItem>
                                    ))
                                ) : (
                                    <Text color="gray.500">No medications recorded</Text>
                                )}
                            </Wrap>
                        )}
                    </FormControl>
                </VStack>
            </Box>

            {/* Emergency Contact */}
            <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow={cardShadow} mb={6}>
                <HStack mb={6}>
                    <Icon as={FiAlertCircle} boxSize={6} color="teal.500" />
                    <Heading size="md" color="teal.700">
                        Emergency Contact
                    </Heading>
                </HStack>
                <Divider mb={6} />
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <FormControl>
                        <FormLabel>Name</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.emergencyContact?.name || ""}
                                onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.emergencyContact?.name || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Relationship</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.emergencyContact?.relationship || ""}
                                onChange={(e) => handleEmergencyContactChange("relationship", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.emergencyContact?.relationship || "Not provided"}</Text>
                        )}
                    </FormControl>
                    <FormControl>
                        <FormLabel>Phone</FormLabel>
                        {isEditing ? (
                            <Input
                                value={formData.emergencyContact?.phone || ""}
                                onChange={(e) => handleEmergencyContactChange("phone", e.target.value)}
                            />
                        ) : (
                            <Text fontWeight="500">{profile.emergencyContact?.phone || "Not provided"}</Text>
                        )}
                    </FormControl>
                </SimpleGrid>
            </Box>

            {/* Registered Facilities */}
            <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow={cardShadow}>
                <HStack mb={6}>
                    <Icon as={FaHospital} boxSize={6} color="teal.500" />
                    <Heading size="md" color="teal.700">
                        Registered Facilities
                    </Heading>
                </HStack>
                <Divider mb={6} />
                <VStack spacing={4} align="stretch">
                    {(profile.facilities || []).length > 0 ? (
                        (profile.facilities || []).map((facility: any, index: number) => (
                            <Box
                                key={index}
                                p={5}
                                borderRadius="xl"
                                bg="teal.50"
                                _hover={{ bg: "teal.100" }}
                                transition="all 0.2s ease"
                            >
                                <HStack justify="space-between" align="flex-start">
                                    <VStack align="flex-start" spacing={2}>
                                        <HStack>
                                            <Heading size="sm" color="teal.800">
                                                {facility.name}
                                            </Heading>
                                            <Badge colorScheme="teal">{facility.facilityType}</Badge>
                                            <Badge colorScheme={facility.status === 'Active' ? 'green' : 'gray'}>
                                                {facility.status}
                                            </Badge>
                                        </HStack>
                                        <Text fontSize="sm" color="teal.600">
                                            MRN: {facility.mrn}
                                        </Text>
                                        {facility.address && (
                                            <Text fontSize="sm" color="gray.600">
                                                {facility.address.street}, {facility.address.city}
                                            </Text>
                                        )}
                                    </VStack>
                                    <VStack align="flex-end" spacing={1}>
                                        <HStack>
                                            <Icon as={FiCalendar} color="teal.500" />
                                            <Text fontSize="sm" color="teal.600">
                                                Registered: {new Date(facility.registeredAt).toLocaleDateString()}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))
                    ) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                            No facilities registered
                        </Text>
                    )}
                </VStack>
            </Box>
        </Container>
    );
}
