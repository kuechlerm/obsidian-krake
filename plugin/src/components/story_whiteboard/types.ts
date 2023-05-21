export type Story = {
    titel: string;
    position: {
        x: number;
        y: number;
    };
};

export type Content = {
    stories: Story[];
};
