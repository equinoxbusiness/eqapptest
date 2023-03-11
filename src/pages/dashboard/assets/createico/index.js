import React from 'react';
import IcoStepFirst from './steps/IcoStepFirst';
import IcoStepSecond from './steps/IcoStepSecond';
import IcoStepThird from './steps/IcoStepThird';
import StepWizard from "react-step-wizard";


function CreateIco(props) {
    return (
        <div className='main-sec'>
            <div className='container mx-auto p-4'>
                <StepWizard>
                    <IcoStepFirst/>
                    <IcoStepSecond/>
                    <IcoStepThird />
                </StepWizard>
            </div>
        </div>
    );
}

export default CreateIco;