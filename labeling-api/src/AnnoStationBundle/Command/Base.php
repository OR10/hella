<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * @SuppressWarnings(PHPMD.NumberOfChildren)
 */
abstract class Base extends ContainerAwareCommand
{
    protected function writeSection(OutputInterface $output, $message)
    {
        $output->writeln("<fg=white;options=bold>=> {$message}</>");
    }

    protected function writeInfo(OutputInterface $output, $message)
    {
        $output->writeln("   -> {$message}");
    }

    protected function writeVerboseInfo(OutputInterface $output, $message)
    {
        if ($output->isVerbose()) {
            $this->writeInfo($output, $message);
        }
    }

    protected function writeError(OutputInterface $output, $message)
    {
        $output->writeln("<error>=> {$message}</>");
    }

    protected function runCommand(OutputInterface $output, $commandName, array $parameters = [])
    {
        $bufferedOutput = new BufferedOutput();
        $command = $this->getApplication()->find($commandName);
        $input = new ArrayInput(array_merge(['command' => $commandName], $parameters));
        $input->setInteractive(false);
        $returnCode = $command->run($input, $bufferedOutput);
        if ($returnCode !== 0) {
            $output->writeln($bufferedOutput->fetch());
            return false;
        }
        return true;
    }
}
