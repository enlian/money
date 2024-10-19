# Personal Net Worth Tracker

This project is a web application designed to help users track their personal net worth over time. Users can record their assets, and the application will display the data in a chart to visualize the growth or decline of their assets. 

## Features
- Add, update, and track personal net worth over time.
- Visualize net worth data in a chart using Chart.js.
- Simple and intuitive interface for easy net worth tracking.

## Tech Stack

The project uses the following technologies:

- **Next.js 14**: A React-based framework for server-side rendering and building web applications.
- **PostgreSQL**: A powerful, open-source object-relational database system used to store the asset data.
- **Chart.js**: A flexible JavaScript charting library used for data visualization.
- **React.js**: A JavaScript library for building user interfaces.
- **Sass**: CSS preprocessor to make the styles more manageable.
- **Node.js**: For server-side logic, particularly for API routes and database interaction.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js (>= 16.x)
- PostgreSQL (>= 12.x)
- Git

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/enlian/nextjs-chartjs-postgres-assets.git
cd nextjs-chartjs-postgres-assets
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project and set the following environment variables for your PostgreSQL connection:

```bash
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_HOST=your_db_host
POSTGRES_PORT=your_db_port
POSTGRES_DATABASE=your_db_name
```

### 4. Set Up the Database

Create the necessary tables in PostgreSQL. Connect to your PostgreSQL instance and run the following SQL command:

```sql
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  date BIGINT NOT NULL,   -- Unix timestamp
  amount BIGINT NOT NULL  -- Asset amount
);
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

### Vercel Deployment

You can deploy this Next.js project directly to [Vercel](https://vercel.com), which is the easiest way to deploy a Next.js app.

1. Create an account on Vercel.
2. Import your GitHub repository into Vercel.
3. Set up environment variables for your PostgreSQL connection in the Vercel dashboard (same as the `.env.local` file).
4. Deploy the project.

### Other Deployment Options

You can also deploy this project to any platform that supports Node.js (e.g., AWS, DigitalOcean, Heroku). Ensure that your environment variables are properly set up, and PostgreSQL is connected.

## Usage

1. **Adding New Records**: Go to the home page and use the form to add your asset details (e.g., date, amount).
2. **Viewing Data**: The chart on the home page will update and show the history of your net worth over time.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

