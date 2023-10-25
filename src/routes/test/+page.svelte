<script async script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { Toaster } from 'svelte-french-toast';
	var localStream: MediaStream;

	let localVideoElement: HTMLVideoElement;
	const init = async () => {
		localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
		if (localStream) localVideoElement.srcObject = localStream;
	};
	init();

	let stopCamera = async () => {
		if (localStream) {
			const tracks = localStream.getTracks();
			tracks.forEach((track) => {
				track.stop();
				localStream.removeTrack(track);
			});
		}
	};

	window.addEventListener('beforeunload', stopCamera);
</script>

<main class="w-full flex flex-col items-center screen justify-center">
	<div class={'flex w-full flex-col h-full'}>
		<div
			class="aspect-video h-auto w-1/2 rounded-md overflow-clip items-center flex flex-col mx-auto my-auto justify-center bg-black"
		>
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				bind:this={localVideoElement}
				playsinline
				autoplay
				muted
				class=" w-full h-full object-cover"
			/>
		</div>
		<Toaster />
	</div>
	<div class="inline-flex items-center justify-center gap-4 mt-3">
		<button
			class={'p-2 bg-red-500 text-2xl font-semibold text-white rounded-full'}
			on:click|preventDefault={() => {
				stopCamera();
				goto('/');
			}}
		>
			<Icon icon="fluent:call-end-16-regular" />
		</button>
	</div>
</main>
