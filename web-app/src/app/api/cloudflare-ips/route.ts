import { NextResponse } from 'next/server';

const CLOUDFLARE_IPS_V4_URL = 'https://www.cloudflare.com/ips-v4';
const CLOUDFLARE_IPS_V6_URL = 'https://www.cloudflare.com/ips-v6'; // Optional: if you want to include v6

export async function GET() {
  try {
    const [ipv4Response, ipv6Response] = await Promise.all([
      fetch(CLOUDFLARE_IPS_V4_URL),
      fetch(CLOUDFLARE_IPS_V6_URL) // Fetch v6 as well
    ]);

    if (!ipv4Response.ok && !ipv6Response.ok) {
      let errorMessages = [];
      if (!ipv4Response.ok) errorMessages.push(`Failed to fetch IPv4s: ${ipv4Response.statusText}`);
      if (!ipv6Response.ok) errorMessages.push(`Failed to fetch IPv6s: ${ipv6Response.statusText}`);
      throw new Error(errorMessages.join(', '));
    }

    let ipv4Text = '';
    if (ipv4Response.ok) {
      ipv4Text = await ipv4Response.text();
    }

    let ipv6Text = '';
    if (ipv6Response.ok) {
      ipv6Text = await ipv6Response.text();
    }

    // Combine and parse or return raw text
    // For this example, returning raw text separated by a marker
    // The client can then split and process
    const combinedText = `IPV4_START\n${ipv4Text}\nIPV4_END\nIPV6_START\n${ipv6Text}\nIPV6_END`;

    return new NextResponse(combinedText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=59', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Error fetching Cloudflare IPs in API route:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}

// Optional: To handle cases where only one of the fetches might fail gracefully
// export async function GET() {
//   let ipv4Text = '';
//   let ipv6Text = '';
//   let errorMessages = [];

//   try {
//     const ipv4Response = await fetch(CLOUDFLARE_IPS_V4_URL);
//     if (ipv4Response.ok) {
//       ipv4Text = await ipv4Response.text();
//     } else {
//       errorMessages.push(`Failed to fetch IPv4s: ${ipv4Response.statusText}`);
//     }
//   } catch (e: any) {
//     errorMessages.push(`Error fetching IPv4s: ${e.message}`);
//   }

//   try {
//     const ipv6Response = await fetch(CLOUDFLARE_IPS_V6_URL);
//     if (ipv6Response.ok) {
//       ipv6Text = await ipv6Response.text();
//     } else {
//       errorMessages.push(`Failed to fetch IPv6s: ${ipv6Response.statusText}`);
//     }
//   } catch (e: any) {
//     errorMessages.push(`Error fetching IPv6s: ${e.message}`);
//   }

//   if (!ipv4Text && !ipv6Text && errorMessages.length > 0) {
//     // If both failed and we have errors
//     return new NextResponse(errorMessages.join('; '), { status: 500 });
//   }

//   const combinedText = `IPV4_START\n${ipv4Text}\nIPV4_END\nIPV6_START\n${ipv6Text}\nIPV6_END`;
//   return new NextResponse(combinedText, {
//       status: 200,
//       headers: { 'Content-Type': 'text/plain', 'Cache-Control': 's-maxage=3600, stale-while-revalidate=59' }
//   });
// }
