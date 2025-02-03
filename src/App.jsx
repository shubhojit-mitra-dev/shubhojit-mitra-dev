import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
    const [commands, setCommands] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [packageManager, setPackageManager] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [currentDirectory, setCurrentDirectory] = useState('shubhojit-mitra-dev');
    const [step, setStep] = useState('cd');
    const [showArrowTooltip, setShowArrowTooltip] = useState(false);
    const terminalRef = useRef(null);
    const inputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            setShowDialog(true);
            localStorage.setItem('hasVisited', 'true');
        }
    }, []);

    useEffect(() => {
        const hasSeenTooltip = localStorage.getItem('hasSeenTooltip');
        if (!hasSeenTooltip) {
            const timer = setTimeout(() => {
                setShowArrowTooltip(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 768) {
            navigate('/portfolio');
        }
    }, [navigate]);

    useEffect(() => {
        if (step === 'complete') {
            const timer = setTimeout(() => {
                window.location.href = '/portfolio';
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleCommand = async (command) => {
        const installCommands = [
            'npm install', 'npm i',
            'yarn install', 'yarn i',
            'pnpm install', 'pnpm i'
        ];

        const devCommands = [
            'npm run dev', 'npm dev',
            'yarn run dev', 'yarn dev',
            'pnpm run dev', 'pnpm dev'
        ];

        if (command.trim() === 'clear') {
            setCommands([]);
            return;
        }

        setCommands(prev => [...prev, { text: command }]);

        if (command.trim() === 'ls') {
            setCommands(prev => [...prev,
                { text: '📁 portfolio', isFolder: true }
            ]);
            setLoading(false);
            return;
        }

        // Step 1: cd portfolio
        if (command.trim() === 'cd portfolio') {
            if (step !== 'cd') {
                setCommands(prev => [...prev, { text: 'Please follow the correct sequence:', isError: true }]);
                setCommands(prev => [...prev, { text: '1. cd portfolio', isError: true }]);
                setCommands(prev => [...prev, { text: '2. npm install (or yarn/pnpm)', isError: true }]);
                setCommands(prev => [...prev, { text: '3. npm run dev (or yarn/pnpm)', isError: true }]);
                return;
            }
            setCurrentDirectory('shubhojit-mitra-dev/portfolio');
            setStep('install');
            setCommands(prev => [...prev, { text: '' }]);
            return;
        }

        // Step 2: package installation
        if (installCommands.includes(command)) {
            if (step !== 'install') {
                if (step === 'cd') {
                    setCommands(prev => [...prev, { text: 'Please run cd portfolio first', isError: true }]);
                } else {
                    setCommands(prev => [...prev, { text: 'Installation already completed', isError: true }]);
                }
                return;
            }

            const pm = command.split(' ')[0];
            setPackageManager(pm);
            setLoading(true);

            const loadingSteps = [
                "Resolving dependencies...",
                "Fetching packages...",
                "Installing dependencies...",
                "       > vite@5.4.10",
                "       > react@18.3.1",
                "       > tailwindcss@3.7.1",
                "Added 250 packages in 3.2s",
                `Done! Now run '${pm} run dev' to start the development server`
            ];

            for (const step of loadingSteps) {
                await new Promise(resolve => setTimeout(resolve, 400));
                setCommands(prev => [...prev, { text: step }]);
            }

            setLoading(false);
            setStep('dev');
            return;
        }

        // Step 3: start dev server
        if (devCommands.includes(command)) {
            if (step !== 'dev') {
                if (step === 'cd') {
                    setCommands(prev => [...prev, { text: 'Please run cd portfolio first', isError: true }]);
                } else if (step === 'install') {
                    setCommands(prev => [...prev, { text: 'Please install dependencies first', isError: true }]);
                }
                return;
            }

            const pm = command.split(' ')[0];
            if (pm !== packageManager) {
                setCommands(prev => [...prev, { text: `Please use ${packageManager} as your package manager`, isError: true }]);
                return;
            }

            setCommands([]);
            await new Promise(resolve => setTimeout(resolve, 500));

            const startupMessages = [
                `   VITE v5.4.10  ready in 518 ms`,
                '',
                '       ➜  Local:   https://shubhojit-mitra-dev.vercel.app/portfolio',
                '       ➜  Network: use --host to expose',
                '       ➜  press h + enter to show help',
                '',
                '   redirecting to /portfolio in 5 seconds...'
            ];

            for (const msg of startupMessages) {
                setCommands(prev => [...prev, { text: msg }]);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            setStep('complete');
        } else {
            setCommands(prev => [...prev, { text: `zsh: command not found: ${command}`, isError: true }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleCommand(currentInput);
            setCurrentInput('');
        }
    };

    const handleInfoClick = () => {
        setShowDialog(true);
        setShowArrowTooltip(false); // Hide tooltip when info button is clicked
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        localStorage.setItem('hasSeenTooltip', 'true');
        setShowArrowTooltip(false);
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        inputRef.current?.focus();
    }, [commands]);

    return (
        <div className="min-h-screen bg-black p-8 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-[#1e1e1e] rounded-lg shadow-xl overflow-hidden">
                {/* Terminal Header */}
                <div className="bg-[#2d2d2d] p-2 flex items-center justify-between">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="text-white/70 text-sm">Terminal</div>
                    <button
                        onClick={handleInfoClick}
                        className="relative text-white/70 hover:text-white"
                    >
                        <Info size={18} />
                        {showArrowTooltip && (
                            <div className="absolute right-full mr-2 whitespace-nowrap bg-blue-500 text-white px-3 py-1 rounded-lg text-sm animate-bounce-horizontal">
                                Need help? Click here! →
                            </div>
                        )}
                    </button>
                </div>

                {/* Terminal Content */}
                <div
                    ref={terminalRef}
                    className="h-[500px] overflow-y-auto p-4 font-mono text-sm"
                    onClick={() => inputRef.current?.focus()}
                >
                    {commands.map((cmd, i) => (
                        <div
                            key={i}
                            className={`mb-1 ${cmd.isError ? 'text-red-500' : 'text-green-400'}`}
                            dangerouslySetInnerHTML={{ __html: cmd.text }}
                        />
                    ))}
                    <div className="flex items-center">
                        <span className="text-blue-400 mr-2"> ~/{currentDirectory}&nbsp;$</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 bg-transparent outline-none text-white caret-white"
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            {/* Info Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Terminal Instructions</h3>
                        <p className="mb-4">
                            Follow these steps in order:
                            <br /><br />
                            1. <code className="bg-gray-100 px-2 py-1 rounded">cd portfolio</code>
                            <br />
                            2. Install dependencies using any package manager:
                            <br />
                            - <code className="bg-gray-100 px-2 py-1 rounded">npm install</code> or <code className="bg-gray-100 px-2 py-1 rounded">npm i</code>
                            <br />
                            - <code className="bg-gray-100 px-2 py-1 rounded">yarn install</code> or <code className="bg-gray-100 px-2 py-1 rounded">yarn i</code>
                            <br />
                            - <code className="bg-gray-100 px-2 py-1 rounded">pnpm install</code> or <code className="bg-gray-100 px-2 py-1 rounded">pnpm i</code>
                            <br /><br />
                            3. Start the development server:
                            <br />
                            - <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> or <code className="bg-gray-100 px-2 py-1 rounded">npm dev</code>
                            <br />
                            - <code className="bg-gray-100 px-2 py-1 rounded">yarn run dev</code> or <code className="bg-gray-100 px-2 py-1 rounded">yarn dev</code>
                            <br />
                            - <code className="bg-gray-100 px-2 py-1 rounded">pnpm run dev</code> or <code className="bg-gray-100 px-2 py-1 rounded">pnpm dev</code>
                        </p>
                        <button
                            onClick={handleDialogClose}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
