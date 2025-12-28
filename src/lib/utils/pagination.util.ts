export const getPaginationParams = ({
    page,
    limit,
}: {
    page: number;
    limit: number;
}) => {
    const skip = (page - 1) * limit;

    return { take: limit, skip };
};
