import React, { useState } from 'react';
import ToggleSwitch from './components/ToggleSwitch';
import { startContainers, stopContainers } from './api/docker';

const App: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);

    const handleToggle = async () => {
        if (isRunning) {
            await stopContainers();
        } else {
            await startContainers();
        }
        setIsRunning(!isRunning);
    };

    return (
        <div>
            <h1>DELoc - Data Engineering Toolkit</h1>
            <ToggleSwitch isChecked={isRunning} onToggle={handleToggle} />
            <p>{isRunning ? 'Containers are running' : 'Containers are stopped'}</p>
        </div>
    );
};

export default App;