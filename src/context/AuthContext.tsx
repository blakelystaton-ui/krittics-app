import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";

// FIX 1: Path corrected from src/context/ to the root-level config/ folder
import { auth } from "../../config/firebase-config";
// FIX 2: Path corrected from src/context/ into the nested src/utils/
import { loginUser, registerUser, logoutUser } from "./src/utils/authService";

// ----------------------------------------------------------------------
// 1. TYPES
// ----------------------------------------------------------------------

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: typeof loginUser;
    register: typeof registerUser;
    logout: typeof logoutUser;
}

// ----------------------------------------------------------------------
// 2. CONTEXT CREATION
// ----------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------------------------------------
// 3. PROVIDER COMPONENT
// ----------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This is the Firebase listener that checks the user's login status in real-time.
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                setCurrentUser(user);
                setLoading(false);
            },
            (error) => {
                console.error("Auth State Change Error:", error);
                setLoading(false);
            },
        );

        // Cleanup function for when the component unmounts
        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* We only render the children once the authentication state has been checked */}
            {!loading && children}
            {loading && (
                <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-400">
                    <p>Loading Authentication...</p>
                </div>
            )}
        </AuthContext.Provider>
    );
};

// ----------------------------------------------------------------------
// 4. HOOK FOR CONSUMING CONTEXT
// ----------------------------------------------------------------------

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthProvider;
