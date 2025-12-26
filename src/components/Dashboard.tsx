'use client';

import React, { useState } from "react";
import {
    Box,
    Flex,
    IconButton,
    Avatar,
    HStack,
    VStack,
    Text,
    Drawer,
    DrawerContent,
    DrawerOverlay,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Button,
    CloseButton,
    Badge,
    InputGroup,
    InputLeftElement,
    Input,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    FiMenu,
    FiBell,
    FiSettings,
    FiUser,
    FiLogOut,
    FiChevronDown,
    FiHome,
    FiCalendar,
    FiUsers,
    FiSearch,
    FiHelpCircle,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const sidebarLinks = [
    { name: "Dashboard", icon: FiHome, path: "/dashboard" },
    { name: "Appointments", icon: FiCalendar, path: "/appointments" },
    { name: "My Doctors", icon: FiUsers, path: "/doctors" },
    { name: "Settings", icon: FiSettings, path: "/settings" },
];

interface SidebarContentProps {
    onClose: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const sidebarBg = useColorModeValue("white", "gray.900");
    const sidebarBorderColor = useColorModeValue("gray.100", "gray.700");

    const handleLogout = () => {
        if (auth?.logout) {
            auth.logout();
            router.push("/login");
        }
    };

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            h="100vh"
            w={{ base: "full", md: "250px" }}
            bg={sidebarBg}
            bgGradient={useColorModeValue("linear(to-b, white 70%, #e6fffa)", "linear(to-b, #1a202c 60%, rgba(6,182,212,0.08))")}
            borderRight="1px solid"
            borderColor={sidebarBorderColor}
            p="6"
            zIndex="100"
            overflowY="auto"
            display="flex"
            flexDirection="column"
            boxShadow={{ base: "xl", md: "none" }}
        >
            {/* Logo */}
            <Flex h="12" alignItems="center" justifyContent="space-between" mb="8">
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={useColorModeValue("teal.600", "teal.300")}
                >
                    Patient Portal
                </Text>

                <CloseButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onClose}
                />
            </Flex>

            {/* Navigation Items */}
            <VStack align="stretch" spacing="2" flex="1">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                        <NavItem
                            key={link.name}
                            icon={link.icon}
                            to={link.path}
                            isActive={isActive}
                            onClick={onClose}
                        >
                            {link.name}
                        </NavItem>
                    );
                })}
            </VStack>

            {/* Bottom Section */}
            <VStack align="stretch" spacing="3" pt="6" borderTop="1px solid" borderColor={sidebarBorderColor}>
                <NavItem icon={FiHelpCircle} isActive={false} onClick={onClose}>
                    Help
                </NavItem>
                <Button
                    leftIcon={<FiLogOut />}
                    variant="ghost"
                    justifyContent="flex-start"
                    w="full"
                    color={useColorModeValue("gray.700", "gray.200")}
                    _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
                    onClick={handleLogout}
                >
                    Log out
                </Button>
            </VStack>
        </Box>
    );
};

interface NavItemProps {
    icon: React.ComponentType<any>;
    children: React.ReactNode;
    to?: string;
    isActive: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, children, to, isActive, onClick }) => {
    const activeBg = useColorModeValue("rgba(6, 182, 212, 0.12)", "whiteAlpha.100");
    const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const textActiveColor = useColorModeValue("teal.600", "teal.200");
    const iconContainerBg = useColorModeValue("teal.50", "whiteAlpha.100");
    const iconContainerActiveBg = useColorModeValue("teal.500", "teal.400");
    const iconColor = useColorModeValue("teal.600", "teal.200");

    if (to) {
        return (
            <Link href={to} onClick={onClick} style={{ textDecoration: "none" }}>
                <Flex
                    align="center"
                    gap="2"
                    px="2"
                    py="2"
                    borderRadius="xl"
                    position="relative"
                    bg={isActive ? activeBg : "transparent"}
                    color={isActive ? textActiveColor : textColor}
                    transition="all 0.2s ease"
                    _hover={{ bg: hoverBg, transform: "translateX(4px)" }}
                >
                    <Flex
                        align="center"
                        justify="center"
                        w="8"
                        h="8"
                        borderRadius="lg"
                        bg={isActive ? iconContainerActiveBg : iconContainerBg}
                        color={isActive ? "white" : iconColor}
                        transition="all 0.2s ease"
                    >
                        <Icon size={18} />
                    </Flex>
                    <Text fontSize="sm" fontWeight={isActive ? "700" : "600"} letterSpacing="wide">
                        {children}
                    </Text>
                    {isActive && (
                        <Box
                            position="absolute"
                            right="3"
                            top="50%"
                            transform="translateY(-50%)"
                            w="2"
                            h="2"
                            borderRadius="full"
                            bg="teal.500"
                        />
                    )}
                </Flex>
            </Link>
        );
    }

    return (
        <Box onClick={onClick} cursor="pointer">
            <Flex
                align="center"
                gap="2"
                px="2"
                py="2"
                borderRadius="xl"
                bg={isActive ? activeBg : "transparent"}
                color={isActive ? textActiveColor : textColor}
                transition="all 0.2s ease"
                _hover={{ bg: hoverBg, transform: "translateX(4px)" }}
            >
                <Flex
                    align="center"
                    justify="center"
                    w="8"
                    h="8"
                    borderRadius="lg"
                    bg={isActive ? iconContainerActiveBg : iconContainerBg}
                    color={isActive ? "white" : iconColor}
                >
                    <Icon size={18} />
                </Flex>
                <Text fontSize="sm" fontWeight={isActive ? "700" : "600"} letterSpacing="wide">
                    {children}
                </Text>
            </Flex>
        </Box>
    );
};

interface AppBarProps {
    onOpen: () => void;
    user: any;
}

const AppBar: React.FC<AppBarProps> = ({ onOpen, user }) => {
    const auth = useAuth();
    const router = useRouter();
    const appBarBg = useColorModeValue("whiteAlpha.900", "gray.900");
    const appBarBorderColor = useColorModeValue("gray.100", "gray.700");
    const searchBg = useColorModeValue("gray.100", "gray.800");
    const searchTextColor = useColorModeValue("gray.600", "gray.300");

    const handleLogout = () => {
        if (auth?.logout) {
            auth.logout();
            router.push("/login");
        }
    };

    return (
        <Flex
            position="sticky"
            top="0"
            left="0"
            right="0"
            height="80px"
            alignItems="center"
            justifyContent="space-between"
            px={{ base: "4", md: "8" }}
            bg={appBarBg}
            borderBottom="1px solid"
            borderColor={appBarBorderColor}
            boxShadow="0 20px 45px -28px rgba(6, 182, 212, 0.6)"
            backdropFilter="saturate(180%) blur(18px)"
            zIndex="90"
        >
            {/* Left Side */}
            <Flex align="center" gap="4" flex="1">
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onOpen}
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiMenu size={24} />}
                    rounded="xl"
                />
                <InputGroup
                    display={{ base: "none", md: "flex" }}
                    maxW="350px"
                    bg={searchBg}
                    borderRadius="xl"
                    size="md"
                    border="1px solid"
                    borderColor={useColorModeValue("rgba(6,182,212,0.18)", "rgba(6,182,212,0.35)")}
                >
                    <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.400" />} />
                    <Input
                        placeholder="Search"
                        border="none"
                        bg="transparent"
                        fontSize="sm"
                        color={searchTextColor}
                        _focus={{ bg: "white", boxShadow: "0 0 0 2px rgba(6,182,212,0.1)" }}
                    />
                </InputGroup>
            </Flex>

            {/* Right Side */}
            <HStack spacing="6">
                <IconButton
                    variant="ghost"
                    aria-label="notifications"
                    icon={
                        <Box position="relative">
                            <FiBell size={20} />
                            <Badge
                                colorScheme="red"
                                borderRadius="full"
                                position="absolute"
                                top="-2"
                                right="-2"
                                fontSize="0.65em"
                                minW="18px"
                                h="18px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                3
                            </Badge>
                        </Box>
                    }
                    rounded="xl"
                />

                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        rightIcon={<FiChevronDown size={18} />}
                        px="3"
                        py="2"
                        borderRadius="xl"
                    >
                        <HStack spacing="2">
                            <Avatar
                                size="sm"
                                name={user?.fullName || "Patient"}
                                src={user?.profileImage || ""}
                            />
                            <VStack display={{ base: "none", md: "flex" }} spacing="0" align="flex-start">
                                <Text fontSize="sm" fontWeight="600">
                                    {user?.fullName || "Patient"}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    {user?.email || "patient@example.com"}
                                </Text>
                            </VStack>
                        </HStack>
                    </MenuButton>
                    <MenuList boxShadow="xl" border="1px solid" borderColor={appBarBorderColor}>
                        <MenuItem as={Link} href="/profile" icon={<FiUser size={16} />}>
                            Profile
                        </MenuItem>
                        <MenuItem as={Link} href="/settings" icon={<FiSettings size={16} />}>
                            Settings
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<FiLogOut size={16} />} onClick={handleLogout}>
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    );
};

interface DashboardProps {
    children: React.ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const auth = useAuth();
    const user = auth?.user;
    const layoutBg = useColorModeValue("gray.50", "gray.900");
    const contentBg = useColorModeValue("white", "gray.800");
    const contentBorder = useColorModeValue("rgba(226, 232, 240, 0.9)", "rgba(255, 255, 255, 0.08)");
    const contentShadow = useColorModeValue("0 25px 50px -30px rgba(6, 182, 212, 0.45)", "0 25px 50px -30px rgba(0, 0, 0, 0.85)");

    const handleClose = () => setIsOpen(false);

    return (
        <Box minH="100vh" bg={layoutBg} transition="background-color 0.2s ease">
            {/* Desktop Sidebar */}
            <Box display={{ base: "none", md: "block" }}>
                <SidebarContent onClose={handleClose} />
            </Box>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="left" onClose={handleClose} size="xs">
                <DrawerOverlay />
                <DrawerContent boxShadow="2xl">
                    <SidebarContent onClose={handleClose} />
                </DrawerContent>
            </Drawer>

            {/* Main Content */}
            <Box ml={{ base: 0, md: "250px" }} minH="100vh" transition="margin 0.2s ease">
                <AppBar onOpen={() => setIsOpen(true)} user={user} />

                <Box
                    as="main"
                    px={{ base: 4, md: 8, lg: 12 }}
                    py={{ base: 6, md: 8, lg: 10 }}
                    bg="transparent"
                    minH="calc(100vh - 80px)"
                >
                    <Box
                        bg={contentBg}
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor={contentBorder}
                        boxShadow={contentShadow}
                        h="full"
                        minH={{ base: "calc(100vh - 120px)", md: "calc(100vh - 140px)" }}
                        p={{ base: 4, md: 6, lg: 8 }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
