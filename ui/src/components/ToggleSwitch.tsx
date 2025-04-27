import React, { useState } from 'react';
import { startContainer, stopContainer } from '../api/docker';

const ToggleSwitch: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);

    const handleToggle = async () => {
        if (isRunning) {
            await stopContainer();
        } else {
            await startContainer();
        }
        setIsRunning(!isRunning);
    };

    return (
        <div>
            <label className="switch">
                <input type="checkbox" checked={isRunning} onChange={handleToggle} />
                <span className="slider round"></span>
            </label>
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
        </div>
    );
};

export default ToggleSwitch;