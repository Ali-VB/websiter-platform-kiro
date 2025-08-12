import React from 'react';
import { Layout, Container } from './common';
import { Hero, Features, HowItWorks, Pricing, TrustSignals, CallToAction } from './landing';

export interface LandingPageProps {
    onStartProject: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartProject }) => {
    return (
        <Layout>
            <Hero onStartProject={onStartProject} />

            <Container id="features" animate>
                <Features />
            </Container>

            <Container id="how-it-works" animate>
                <HowItWorks />
            </Container>

            <Container id="pricing" animate>
                <Pricing />
            </Container>

            <Container animate>
                <TrustSignals />
            </Container>

            <Container animate>
                <CallToAction onStartProject={onStartProject} />
            </Container>
        </Layout>
    );
};