import { Button } from "./components/ui/button";
import BlueSSULogo from "./assets/bluessu.png";
import { useState } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import axios from "axios";
import { toast } from "sonner";

const fetchGetToken = async (code: string) => {
    const response = await axios.post(
        `${import.meta.env.VITE_BLUESSU_CORE_URL}/oauth/token`,
        {
            clientId: localStorage.getItem("clientId"),
            clientSecret: localStorage.getItem("clientSecret"),
            code,
        }
    );
    return (await response.data) as {
        token: {
            accessToken: string;
            refreshToken: string;
        };
    };
};

const fetchGetUser = async (accessToken: string) => {
    const response = await axios.get(
        `${import.meta.env.VITE_BLUESSU_CORE_URL}/oauth/profile`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return (await response.data) as {
        user: {
            name: string;
            studentId: string;
            department: string;
            profileImage: string;
        };
    };
};

function App() {
    const [clientId, setClientId] = useState(
        localStorage.getItem("clientId") || ""
    );
    const [clientSecret, setClientSecret] = useState(
        localStorage.getItem("clientSecret") || ""
    );
    const redirectURL = `${window.location.origin}`;

    localStorage.setItem("clientId", clientId);
    localStorage.setItem("clientSecret", clientSecret);

    const code = new URLSearchParams(window.location.search).get("code");
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const getToken = async () => {
        const code = new URLSearchParams(window.location.search).get("code");
        if (!code) return;
        setIsLoading(true);
        try {
            const res = await fetchGetToken(code);
            toast.success("토큰 교환에 성공했어요");
            setAccessToken(res.token.accessToken);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    const [user, setUser] = useState<{
        name: string;
        studentId: string;
        department: string;
        profileImage: string;
    } | null>(null);
    const getUser = async () => {
        if (!accessToken) return;
        setIsLoading(true);
        try {
            const res = await fetchGetUser(accessToken);
            setUser(res.user);
            toast.success("유저 조회에 성공했어요");
            console.log(res);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <div className="w-[100dvw] h-[100dvh] flex flex-col items-center justify-center gap-2">
            <div className="p-4 border rounded max-w-[440px] w-full flex justify-between gap-4">
                <div className="">BlueSSU OAuth Example</div>
                <a
                    href="https://github.com/blue-ssu/bluessu-oauth-example-react"
                    target="_blank"
                >
                    <svg
                        role="img"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-[28px] h-[28px]"
                    >
                        <title>GitHub</title>
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                </a>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>Client</h2>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <Label>Client ID</Label>
                        <Input
                            placeholder="Client ID"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Client Secret</Label>
                        <Input
                            placeholder="Client Secret"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Redirect URL</Label>
                        <Input
                            placeholder="Client ID"
                            value={`${redirectURL}`}
                            readOnly
                        />
                    </div>
                </div>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>OAuth 로그인</h2>
                <div className="flex flex-col gap-1">
                    <Button
                        className="flex items-center gap-2"
                        variant={"outline"}
                        disabled={!clientId || !clientSecret}
                        onClick={() =>
                            (window.location.href = `${
                                import.meta.env.VITE_BLUESSU_OAUTH_URL
                            }/oauth?client_id=${clientId}&redirect_url=${redirectURL}`)
                        }
                    >
                        <img src={BlueSSULogo} className="w-[24px] h-[24px]" />
                        BlueSSU로 로그인
                    </Button>
                    <div className="text-muted-foreground text-[12px] text-center">
                        {import.meta.env.VITE_BLUESSU_OAUTH_URL}
                        /oauth?client_id=
                        {clientId}&redirect_url={redirectURL}
                    </div>
                </div>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>로그인 확인</h2>
                <div className="flex flex-col gap-2">
                    <div className="text-muted-foreground text-[12px] text-center">
                        code: {code ? "YES" : "NO"}
                        <br />
                        accessToken: {accessToken ? "YES" : "NO"}
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        variant={"outline"}
                        onClick={() => getToken()}
                        disabled={!code || isLoading}
                    >
                        토큰 교환
                    </Button>
                </div>
            </div>
            <div className="p-4 border rounded max-w-[440px] w-full flex flex-col gap-4">
                <h2>유저 조회</h2>
                <div className="flex flex-col gap-2">
                    <Button
                        className="flex items-center gap-2"
                        variant={"outline"}
                        onClick={() => getUser()}
                        disabled={!accessToken || isLoading}
                    >
                        조회
                    </Button>
                    {user && (
                        <div className="flex items-center gap-2 m-auto border rounded px-4 py-2">
                            <img
                                src={user.profileImage}
                                alt=""
                                className="w-[40px] h-[40px]"
                            />
                            <div className="flex flex-col ">
                                <div className="font-medium text-sm">
                                    {user.department} {user.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {user.studentId}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
