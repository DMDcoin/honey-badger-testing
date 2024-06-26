#!/bin/bash

# copied from https://github.com/lab10-coop/testnet-utils/blob/master/local-testnet/parity_aura/run_testnet.sh and adapted

# usage: $0 <testnet name>
# runs all nodes for the specified testnet (needs to already be initialized)

set -e
set -u

name=$1
PARITY=$(pwd)"/../../diamond-node/target/release/diamond-node"

die() {
	echo "$*" 1>&2
	exit 1
}

# some sanity checks

if [[ ! -d $name ]]; then
	die "$name does not exist"
fi

pushd $name

nr_nodes=`find . -type d -name "node*" | wc -l`
if [ ! "$nr_nodes" -eq "$nr_nodes" ]; then
	die "no valid number found in file nr_nodes"
fi

check_jobs() {
	# display jobs stopped since last check
	jobs -lns
}

pids=()
for i in $(seq 1 $nr_nodes); do
	nodedir="node$i"
	pushd $nodedir
	#extra_args="-l network=debug"
	extra_args=""
	#$PARITY -c $nodedir/node.toml $extra_args &> /dev/null &
	$PARITY -c node.toml $extra_args &
	# push pid of spawned process to pids array
	pids+=($!)
	echo "$nodedir: parity pid ${pids[-1]}"

	if [[ $i == 0 ]]; then
		echo "started first node"
		sleep 1
	fi
	popd
done

echo "started jobs: ${pids[*]}"

echo
echo "waiting for termination..."
echo

kill_all() {
	if kill ${pids[*]}; then
		echo "kill_all succeeded"
	else
		echo "### kill_all didn't succeed. Check manually!"
		# kill -9 would probably do the job reliably. But I don't want to be brutal by default
	fi
}

#trap "kill ${pids[*]}" SIGINT SIGTERM
trap kill_all SIGINT SIGTERM

# now block (waits for all children to exit)
#wait ${pids[*]}
#wait

prev_state=""
while true; do
	dead_procs=("")
	for pid in ${pids[*]}; do
		if ! ps $pid > /dev/null; then
			dead_procs+=($pid)
		fi
	done
	
	if [[ "${dead_procs[*]}" != $prev_state ]]; then
		echo "### dead processes: ${dead_procs[*]}"
		prev_state="${dead_procs[*]}"
	fi
	
	if [[ `jobs | wc -l` == 0 ]]; then
		echo "no jobs remaining. Exiting"
		exit
	fi
	sleep 5
done

# Unfortunately, bash seems to not offer a more elegant way to monitor background jobs.
# While one can just use "wait" to have the script wait for child processes, this won't notify about dying children.
# trapping SIGCHLD shouldn't in theory achieve just that, but it doesn't work in scripts, because "job control" is off in non-interactive mode (script).
# While job control can be manually turned on, it just leads to another set of issues. See https://stackoverflow.com/questions/6769414/bash-restart-sub-process-using-trap-sigchld

